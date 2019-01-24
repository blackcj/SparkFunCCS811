// This #include statement was automatically added by the Particle IDE.
#include <SparkFunMicroOLED.h>

// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_Si7021.h>

// This #include statement was automatically added by the Particle IDE.
#include "SparkFunCCS811.h"

//Default I2C Address for the CCS811
#define CCS811_ADDR 0x5B

SYSTEM_MODE(SEMI_AUTOMATIC);
SYSTEM_THREAD(ENABLED);
//STARTUP(WiFi.selectAntenna(ANT_AUTO)); // continually switches at high speed between antennas
//STARTUP(WiFi.selectAntenna(ANT_EXTERNAL)); // selects the u.FL antenna
STARTUP(WiFi.selectAntenna(ANT_INTERNAL));

CCS811 myCCS811(CCS811_ADDR);
Adafruit_Si7021 sensor = Adafruit_Si7021();
MicroOLED oled;
CCS811Core::status returnCode;
const uint32_t msRetryTime  =   30000; // stop trying after 30sec

char resultstr[128]; // This is where we will put the data
int yOffset = 0;
int xOffset = 0;

bool sensorReady = false; // This will be set to true after the 10 minute idle period
bool warmUp = true; // This will be set to false after the 30 minute warm up
uint32_t startTime; // Time we booted up the device

void setup() {
    // SEMI-AUTOMATIC mode allows us to read oled even without a cloud connection.
    // This is good for measurements on the go (no WiFi).
    Particle.connect();
    if (!waitFor(Particle.connected, msRetryTime)) { // Wait for 30 seconds
        WiFi.off();                // no luck, no need for WiFi
        RGB.control(true);
        RGB.color(0, 0, 0);        // turn off blinking green light if no WiFi
    }
    if(Particle.connected()) {
        Particle.publish("log", "Air Quality Start");
        Particle.variable("result", resultstr, STRING);
    }

    // Set boot time to now
	  startTime = millis();

    oled.begin();       // Initialize the OLED
    oled.clear(ALL);    // Clear the display's internal memory
    oled.display();     // Display what's in the buffer (splashscreen)
    delay(500);         // Delay 500 ms
    oled.clear(PAGE);   // Clear the buffer.



    // Start the Si7021 temperature sensor
    sensor.begin();

    //This begins the CCS811 sensor and prints error status of .begin()
    returnCode = myCCS811.begin();
    printStatus();
    delay(1000);
    // Documentation recommends setting the mode to idle for 10 minutes
    // before switching to mode 2 or 3.
    if(Particle.connected()) {
        Particle.publish("state", "Setting sensor mode to 0");
    }
    returnCode = myCCS811.setDriveMode(0);
    printStatus();
}

void loop() {
    double t = sensor.readTemperature();
    double h = sensor.readHumidity();
    double f = t * 1.8 + 32;

    // Give the sensor 10 minutes in idle (mode 0) before setting to 10 second interval (mode 2)
    if (!sensorReady && millis() - startTime >= 600000){
        if(Particle.connected()) {
            Particle.publish("state", "Setting sensor mode to 3");
        }
        // Modes: 0 idle, 1 every second, 2 every 10 seconds, 3 every 60 seconds
        returnCode = myCCS811.setDriveMode(3);
        printStatus();
        delay(1000);
        sensorReady = true;
    }

    // Wait for device to warm up. Documentation says 20 minutes but it seems like 30 - 40 is more accurate.
    if (millis() - startTime >= 2400000){
        if(warmUp && Particle.connected()) {
            Particle.publish("state", "Warm up complete");
        }
        warmUp = false;
    }

    if(t > 0 && h > 0) {
        myCCS811.setEnvironmentalData(h, t);
    }

    if(sensorReady) {
        // Data will only be available if we wait at least the number of seconds dictated by the drive mode
        if (myCCS811.dataAvailable())
        {
            myCCS811.readAlgorithmResults();
            delay(750);
            int co2 = myCCS811.getCO2();    // CO2 equivalent value (NOT actual CO2)
            int voc = myCCS811.getTVOC();
            printValuesToOLED(f, h, voc);

            if(Particle.connected()) {
                sprintf(resultstr, "{\"humidity\":%4.2f,\"temp\":%4.2f,\"voc\":%i,\"co2\":%i}", h, f, voc, co2);
                Particle.publish("reading", resultstr);
            }
        }else if (myCCS811.checkForStatusError()){
            if(Particle.connected()) {
                Particle.publish("log","Failed to read CCS811 sensor!");
            }
            clearOLED();
            oled.print("Error");
            oled.display();         // Draw on the screen
        } else {
            clearOLED();
            oled.print("No Data");
            oled.display();         // Draw on the screen
        }
    } else {
        printIdleValuesToOLED(f, h);
    }
    delay(65000); // Delay at least 60 seconds or adjust drive mode accordingly
}

// Print status returned from CCS811
void printStatus() {
    clearOLED();
    switch ( returnCode )
    {
        case CCS811Core::SENSOR_SUCCESS:
            oled.print("SUCCESS");
            Particle.publish("status", "SUCCESS");
            break;
        case CCS811Core::SENSOR_ID_ERROR:
            oled.print("ID_ERROR");
            Particle.publish("status", "ID_ERROR");
            break;
        case CCS811Core::SENSOR_I2C_ERROR:
            oled.print("I2C_ERROR");
            Particle.publish("status", "I2C_ERROR");
            break;
        case CCS811Core::SENSOR_INTERNAL_ERROR:
            oled.print("INTERNAL_ERROR");
            Particle.publish("status", "INTERNAL_ERROR");
            break;
        case CCS811Core::SENSOR_GENERIC_ERROR:
            oled.print("GENERIC_ERROR");
            Particle.publish("status", "GENERIC_ERROR");
            break;
        default:
            oled.print("Unspecified error.");
            Particle.publish("status", "Unspecified error.");
    }
    oled.display();     // Draw on the screen
    delay(5000);       // Wait 5 seconds so we can read the status
}

void clearOLED()
{
    // Move the offset to help prevent OLED burn in
    yOffset += 1;
    if(yOffset > 8) {
        yOffset = 0;
        xOffset += 1;
    }
    if(xOffset > 8) {
        xOffset = 0;
    }
    oled.clear(PAGE);       // Clear the buffer.
    oled.setCursor(0 + xOffset, 0 + yOffset);   // Set cursor to top-left
    oled.setFontType(0);    // Use the smallest font
}

// Print errors returned from CCS811
void printSensorError()
{
    clearOLED();
    uint8_t error = myCCS811.getErrorRegister();

    if ( error == 0xFF ) //comm error
    {
        oled.print("Failed to get ERROR_ID register.");
        Particle.publish("error", "Failed to get ERROR_ID register.");
    }
    else
    {
        if (error & 1 << 5) {
            oled.print("HeaterSupply");
            Particle.publish("error", "HeaterSupply");
        }
        if (error & 1 << 4) {
            oled.print("HeaterFault");
            Particle.publish("error", "HeaterFault");
        }
        if (error & 1 << 3) {
            oled.print("MaxResistance");
            Particle.publish("error", "MaxResistance");
        }
        if (error & 1 << 2) {
            oled.print("MeasModeInvalid");
            Particle.publish("error", "MeasModeInvalid");
        }
        if (error & 1 << 1) {
            oled.print("ReadRegInvalid");
            Particle.publish("error", "ReadRegInvalid");
        }
        if (error & 1 << 0) {
            oled.print("MsgInvalid");
            Particle.publish("error", "MsgInvalid");
        }
    }
    oled.display();     // Draw on the screen
    delay(5000);        // Wait 5 seconds so we can read the error
}

// Print values to OLED display
void printIdleValuesToOLED(double f, double h) {
    clearOLED();
    oled.print("idle: ");
    int idleRemaining = (600000 - millis() - startTime) / 60000 + 1;
    oled.print(idleRemaining);
    oled.setCursor(0 + xOffset, 16 + yOffset);  // Set cursor to middle-left
    oled.print("t: ");
    oled.print(f);          // Print temperature value
    oled.setCursor(0 + xOffset, 32 + yOffset);  // Set cursor bottom-left
    oled.print("h: ");
    oled.print(h);          // Print humidity value
    oled.display();         // Draw on the screen
}

// Print values to OLED display
void printValuesToOLED(double f, double h, int voc) {
    clearOLED();
    oled.print("voc: ");
    oled.print(voc);        // Print co2 value
    oled.setCursor(0 + xOffset, 16 + yOffset);  // Set cursor to middle-left
    oled.print("t: ");
    oled.print(f);          // Print temperature value
    oled.setCursor(0 + xOffset, 32 + yOffset);  // Set cursor bottom-left
    oled.print("h: ");
    oled.print(h);          // Print humidity value
    oled.display();         // Draw on the screen
}
