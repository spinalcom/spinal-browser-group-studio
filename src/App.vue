<template>
  <div id="app" v-cloak>
    <md-app md-mode="reveal">
      <md-app-toolbar class="app-header">
        <div class="md-toolbar-row">
          <div class="md-toolbar-section-start">
            <img src="dist/assets/img/SpinalBIMInspectorLogo.png" alt="SpinalBIM Inspector" style="height: 42px;margin-top: 4px;">
          </div>
          <div class="md-toolbar-section-end">
              {{username}}
            <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
              <md-icon>menu</md-icon>
            </md-button>
          </div>
        </div>
      </md-app-toolbar>

      <md-app-drawer class="md-right" :md-active.sync="menuVisible">
        <md-toolbar class="app-header" md-elevation="0">
          <div class="md-toolbar-row">
            <div class="md-toolbar-section-start">
              <img src="dist/assets/img/SpinalBIMInspectorLogo.png" alt="SpinalBIM Inspector" style="height: 42px;margin-top: 4px;">
            </div>
            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
                <md-icon>menu</md-icon>
              </md-button>
            </div>
          </div>
        </md-toolbar>

        <md-list>
          <md-list-item @click="go_toDrive">
            <md-icon>power_settings_new</md-icon>
            <span class="md-list-item-text">Return to SpinalBIM Drive</span>
          </md-list-item>

          
          <md-list-item @click="sign_out">
            <md-icon>power_settings_new</md-icon>
            <span class="md-list-item-text">Sign out</span>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <md-dialog v-if="groupSelected" :md-active.sync="showChart" :md-fullscreen=false>
            <md-dialog-title>Selected group : {{groupSelected.name}}
            </md-dialog-title>
            <md-dialog-content>
              <Chart class="m_chart" :data="chardata"
              :options="{responsive: true, maintainAspectRatio: false, legend: {labels : {fontColor : '#fff'}}}"
              />
            </md-dialog-content>
            <md-dialog-actions>
              <md-button class="md-primary" @click="showChart = false">Close</md-button>
            </md-dialog-actions>
        </md-dialog>


        <md-dialog v-if="groupSelected" :md-fullscreen=false :md-active.sync="showDialog">
            <md-dialog-title>Select group : {{bimobjectSelected.name}}
            </md-dialog-title>
            <md-dialog-content>
              <md-list>
                <md-list-item @click="triItem(bimobjectSelected, groupSelected.referencial)">
                  <md-icon :style="getColor(groupSelected.referencial)">turned_in</md-icon>
                  <span class="md-list-item-text"> {{groupSelected.referencial.name}}</span>
                  <md-icon v-if="bimobjectSelected.group === groupSelected.referencial.id">check</md-icon>
                </md-list-item>

                <md-list-item v-for="group in groupSelected.group" v-bind:key="group.id" @click="triItem(bimobjectSelected, group)">
                  <md-icon :style="getColor(group)">turned_in</md-icon>
                  <span class="md-list-item-text"> {{group.name}}</span>
                  <md-icon v-if="bimobjectSelected.group === group.id">check</md-icon>
                    
                </md-list-item>
              </md-list>
            </md-dialog-content>
            <md-dialog-actions>
              <md-button class="md-primary" @click="showDialog = false">Close</md-button>
            </md-dialog-actions>
        </md-dialog>

        <md-list>
          <md-list-item v-for="group in groupLst" v-bind:key="group.id" md-expand>
            <md-icon>label</md-icon>
            <span class="md-list-item-text">{{group.name}}</span>
            <md-button class="md-icon-button md-list-action" v-on:click.stop="clicShowChart(group)">
              <md-icon>pie_chart</md-icon>
            </md-button>

            <md-list slot="md-expand">
              <md-list-item class="md-inset" md-expand>
                <md-icon :style="getColor(group.referencial)">label_outline</md-icon>
                <span class="md-list-item-text">{{group.referencial.name}}</span>
                <md-field class="search-bar" md-inline md-clearable>
                  <label>Search</label>
                  <md-input v-model="group.search" v-on:click.stop></md-input>
                </md-field>
                <md-list slot="md-expand">
                  <md-list-item class="md-inset spinal-inset2" v-for="bimobject in filteredSubGrp(group.referencial.allObject, group.search)" v-bind:key="bimobject.id"
                  @click="clicItem(group, bimobject)">
                    <md-icon :style="getColorById(group, bimobject)">turned_in</md-icon>
                    <span class="md-list-item-text">{{bimobject.dbId}} - {{bimobject.name}}</span>
                  </md-list-item>
                </md-list>
              </md-list-item>

              <md-list-item class="md-inset" v-for="subgroup in group.group" v-bind:key="subgroup.id" md-expand>
                <md-icon :style="getColor(subgroup)">label_outline</md-icon>
                <span class="md-list-item-text">{{subgroup.name}}</span>
                <md-field class="search-bar" md-inline md-clearable>
                  <label>Search</label>
                  <md-input v-model="subgroup.search" v-on:click.stop></md-input>
                </md-field>
                <md-list slot="md-expand">
                  <md-list-item class="md-inset spinal-inset2" v-for="bimobject in filteredSubGrp(subgroup.allObject, subgroup.search)" v-bind:key="bimobject.id"
                  @click="clicItem(group, bimobject)">
                    <md-icon :style="getColor(subgroup)">turned_in</md-icon>
                    <span class="md-list-item-text">{{bimobject.dbId}} - {{bimobject.name}}</span>
                  </md-list-item>
                </md-list>
              </md-list-item>
            </md-list>
          </md-list-item>
        </md-list>

      </md-app-content>
    </md-app>

  </div>
</template>

<script>
import spinal from "./SpinalObject.js";
import Chart from "./chart.vue";

function getSelectedGrpModel(groupSelected, model) {
  for (var i = 0; i < model.length; i++) {
    if (groupSelected.id === model[i].id.get()) {
      return model[i];
    }
  }
  return null;
}
function getSubGrpById(grpModel, id) {
  if (id === 0) {
    return grpModel.referencial;
  }
  return grpModel.group[id - 1];
}

export default {
  name: "app",
  data() {
    var vm = this;
    return {
      username: "",
      menuVisible: false,
      groupSelected: null,
      bimobjectSelected: { name: "", color: "" },
      showDialog: false,
      showChart: false,
      groupLst: [],
      chardata: {
        labels: [],
        datasets: [
          {
            borderWidth: 0.5,
            backgroundColor: [],
            data: []
          }
        ]
      },
      go_toDrive: () => {
        window.location = "/html/drive/";
      },
      sign_out: () => {
        spinal.signOut();
        window.location = "/html/drive/#!/login');";
      },
      getColor: item => {
        return "color : " + item.color;
      },
      getColorById: (group, bimobject) => {
        if (bimobject.group === 0) {
          return "color : " + group.referencial.color;
        } else if (group.group[bimobject.group - 1]) {
          return "color : " + group.group[bimobject.group - 1].color;
        }
        return "";
      },
      clicItem: (group, bimobject) => {
        vm.groupSelected = group;
        vm.bimobjectSelected = bimobject;
        vm.showDialog = true;
      },
      filteredSubGrp: (subgroup, search) => {
        if (!search) return subgroup;
        return subgroup.filter(obj => {
          let s = search.toLocaleUpperCase();
          return (
            obj.dbId.toString().match(s) ||
            obj.name.toLocaleUpperCase().match(s)
          );
        });
      },
      triItem: (bimobjectSelected, group) => {
        let grpModel = getSelectedGrpModel(vm.groupSelected, vm.model);
        if (grpModel) {
          let srcSubModel = getSubGrpById(grpModel, bimobjectSelected.group);
          let dstSubModel = getSubGrpById(grpModel, group.id);
          if (srcSubModel === dstSubModel) {
            vm.showDialog = false;
            return;
          }
          for (var i = 0; i < srcSubModel.allObject.length; i++) {
            if (srcSubModel.allObject[i].dbId.get() == bimobjectSelected.dbId) {
              srcSubModel.allObject[i].group.set(dstSubModel.id.get());
              if (dstSubModel.id.get() != 0)
                dstSubModel.allObject.push(srcSubModel.allObject[i]);
              if (srcSubModel.id.get() != 0) srcSubModel.allObject.splice(i, 1);
              vm.showDialog = false;
              break;
            }
          }
        }
      },
      clicShowChart: grp => {
        vm.chardata.labels.splice(0, vm.chardata.labels.length);
        vm.chardata.datasets[0].data.splice(
          0,
          vm.chardata.datasets[0].data.length
        );
        vm.chardata.datasets[0].backgroundColor.splice(
          0,
          vm.chardata.datasets[0].backgroundColor.length
        );
        vm.groupSelected = grp;
        let count = 0;
        for (
          var y = 0;
          y < vm.groupSelected.referencial.allObject.length;
          y++
        ) {
          if (vm.groupSelected.referencial.allObject[y].group === 0) count++;
        }

        vm.chardata.labels.push(vm.groupSelected.referencial.name);
        vm.chardata.datasets[0].data.push(count);
        vm.chardata.datasets[0].backgroundColor.push(
          vm.groupSelected.referencial.color
        );
        for (var i = 0; i < vm.groupSelected.group.length; i++) {
          vm.chardata.labels.push(vm.groupSelected.group[i].name);
          vm.chardata.datasets[0].data.push(
            vm.groupSelected.group[i].allObject.length
          );
          vm.chardata.datasets[0].backgroundColor.push(
            vm.groupSelected.group[i].color
          );
        }
        vm.showChart = true;
      }
    };
  },
  created() {
    var vm = this;
    let spinalIO = new spinal();
    vm.username = spinalIO.getUser().username;
    spinalIO.getModel().then(alertPluginLst => {
      vm.model = alertPluginLst;
      alertPluginLst.bind(() => {
        vm.groupLst = alertPluginLst.get();
      });
    });
  },
  components: { Chart }
};
</script>

<style scoped>
.app-header {
  background-color: #fff;
}
.app-header .md-button,
.app-header .md-icon,
.app-header div {
  color: black;
}
.md-inset {
  background-color: #2c2c2c;
}
.spinal-inset2 {
  padding-left: 20px;
  background-color: #1c1c1c;
}
.search-bar {
  width: 20%;
  margin: 0;
}
.m_chart {
  max-height: 33vh;
}

#app .md-app {
  height: 100vh;
}
</style>
