<template>
  <div id="app" v-cloak>
  <md-toolbar>
    <h1 class="md-title">Group Studio</h1>
  </md-toolbar>

    <md-dialog v-if="groupSelected" :md-fullscreen=false :md-active.sync="showDialog">
        <md-dialog-title>Select group : {{bimobjectSelected.name}}

        </md-dialog-title>
        <md-dialog-content>
          <md-list>
            <md-list-item @click="triItem(bimobjectSelected, groupSelected.referencial)">
              <md-icon :style="getColor(groupSelected.referencial)">domain</md-icon>
              <span class="md-list-item-text"> {{groupSelected.referencial.name}}</span>
              <md-icon v-if="bimobjectSelected.group === groupSelected.referencial.id">check</md-icon>
            </md-list-item>

            <md-list-item v-for="group in groupSelected.group" v-bind:key="group.id" @click="triItem(bimobjectSelected, group)">
              <md-icon :style="getColor(group)">domain</md-icon>
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
        <md-list slot="md-expand">

          <md-list-item class="md-inset" md-expand>
            <md-icon :style="getColor(group.referencial)">label_outline</md-icon>
            <span class="md-list-item-text">{{group.referencial.name}}</span>
            <md-list slot="md-expand">
              <md-list-item class="md-inset" v-for="bimobject in group.referencial.allObject" v-bind:key="bimobject.id"
              @click="clicItem(group, bimobject)">
                <md-icon :style="getColorById(group, bimobject)">domain</md-icon>
                <span class="md-list-item-text">{{bimobject.name}}</span>
              </md-list-item>
            </md-list>
          </md-list-item>


          <md-list-item class="md-inset" v-for="subgroup in group.group" v-bind:key="subgroup.id" md-expand>
            <md-icon :style="getColor(subgroup)">label_outline</md-icon>
            <span class="md-list-item-text">{{subgroup.name}}</span>
            <md-list slot="md-expand">
              <md-list-item class="md-inset" v-for="bimobject in subgroup.allObject" v-bind:key="bimobject.id"
              @click="clicItem(group, bimobject)">
                <md-icon :style="getColor(subgroup)">domain</md-icon>
                <span class="md-list-item-text">{{bimobject.name}}</span>
              </md-list-item>
            </md-list>
          </md-list-item>
        </md-list>
      </md-list-item>
    </md-list>
  </div>
</template>

<script>
import spinal from "./SpinalObject.js";

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
      groupSelected: null,
      bimobjectSelected: { name: "", color: "" },
      showDialog: false,
      groupLst: [],
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
      }
    };
  },
  created() {
    var vm = this;
    let test = new spinal();
    test.getModel().then(alertPluginLst => {
      vm.model = alertPluginLst;
      alertPluginLst.bind(() => {
        vm.groupLst = alertPluginLst.get();
      });
    });
  }
};
</script>

<style scoped>

</style>
