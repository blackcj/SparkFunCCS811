const axios = require('axios');
const Vue = require('vue');

new Vue({
  el: '#app',
  data: {
    deviceId: '',
    deviceLocation: '',
    authToken: '',
    devices: [],
    entries: [],
  },
  mounted () {
    this.getDevices();
  },
  // our methods
  methods: {
    processForm: function() {
      axios({
        method: 'POST',
        url: '/devices',
        data: { device_id: this.deviceId, location: this.deviceLocation, auth_token: this.authToken }
      }).then(response => {
        this.deviceId = '';
        this.deviceLocation = '';
        this.authToken = '';
        this.getDevices();
      }).catch(error => {
        console.log(error);
      })
    },
    getDevices: function() {
      axios({
        method: 'GET',
        url: '/devices',
      }).then(response => {
        this.devices = response.data;
      }).catch(error => {
        console.log(error);
      })
    },
    getEntries: function (deviceId) {
      console.log('Device clicked',deviceId);
      axios({
        method: 'GET',
        url: `/entries/${deviceId}`,
      }).then(response => {
        this.entries = response.data;
      }).catch(error => {
        console.log(error);
      })
    }
  }
})
