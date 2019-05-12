/* 
  Copyright (C) 2019  Kim Nyholm

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const TasmotaDeviceClass = require('./TasmotaDeviceClass').TasmotaDeviceClass;
let _devices = {};

const ipBase = ip => {
    const lastDot = ip.lastIndexOf('.');
    const base = ip.substring(0, lastDot+1);
    return base
}

const ipFirstNumber = ip => {
    const lastDot = ip.lastIndexOf('.');
    const first = ip.substring(lastDot+1);
    return parseInt(first)
}

const startNext = () => {
    for (let ip in _devices) {
        if (_devices.hasOwnProperty(ip)){
            const device = _devices[ip];
            if (device.state === "created"){
                device.tasmotaDevice.tryConnection();
                device.state = "searching";
//                break;
            }
        }
    }
}

export default { 

    gatherInfo: () => {
        startNext()
    },

    populate: ipFirst => {
        _devices = {};
        const base = ipBase(ipFirst);
        const first = ipFirstNumber(ipFirst);
        for (let i = first; i< 256; i++){
            const ip = base + i;
            const device = {IP: ip, type: 'Tasmota', state: 'created', name: 'unknown', model: 'unknown'}
            device.tasmotaDevice=new TasmotaDeviceClass(ip, connectionHandler);
            _devices[ip] = device;
        }
        return _devices;
    }
};

const connectionHandler = (ip, state) => {
    console.log("connectionHandler", ip, state)
    _devices[ip].state = state ? "Responing" : "No device";
    startNext()
}