import {} from "spinal-core-connectorjs";
import * as Q from 'q';

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class spinal {
  constructor() {
    this.conn = spinalCore.connect('http://168:JHGgcz45JKilmzknzelf65ddDadggftIO98P@' + window.location.host + '/');
  }

  getModel() {
    let defer = Q.defer();
    let path = getParameterByName("path");
    if (!path) {
      window.location.pathname = "/html/drive/";
    }
    path = atob(path);
    spinalCore.load(this.conn, path, (forgefile) => {
      if (forgefile.groupAlertPlugin) {
        forgefile.groupAlertPlugin.load((model) => {
          this.model = model;
          defer.resolve(this.model);
        });
      } else
        defer.reject();
    }, () => {});

    return defer.promise;
  }
}




export default spinal;