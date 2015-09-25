'use strict';

(function() {
    angular.module('ncsaas')
    .controller('CustomerListController', [
      'customersService',
      'baseControllerListClass',
      'usersService',
      'ENTITYLISTFIELDTYPES',
      '$rootScope',
      '$state',
      'ENV',
      CustomerListController
    ]);

  function CustomerListController(
    customersService, baseControllerListClass, usersService, ENTITYLISTFIELDTYPES, $rootScope, $state, ENV) {
    var controllerScope = this;
    var CustomerController = baseControllerListClass.extend({
      init:function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'name';
        this.currentUser = usersService.currentUser;
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(controllerScope),

            isDisabled: function(customer) {
              return !this.isOwnerOrStaff(customer) || customer.projects.length != 0;
            }.bind(controllerScope),

            tooltip: function(customer) {
              if (!this.isOwnerOrStaff(customer)) {
                return 'Only owner or staff can remove organization';
              }
              if (customer.projects.length != 0) {
               return 'Organization has projects. Please remove them first';
              }
            }.bind(controllerScope),
          },
          {
            title: 'Add provider',
            clickFunction: function(customer) {
              $rootScope.$broadcast('adjustCurrentCustomer', customer);
              $state.go('services.create')
            }
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no organizations yet.',
            title: 'Organizations',
            createLink: 'organizations.create',
            createLinkText: 'Add organization'
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'organizations.details({uuid: entity.uuid})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            }
          ]
        };
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('plans') == -1) {
          this.entityOptions.list.push({
            name: 'Plan',
            propertyName: 'plan_name',
            type: ENTITYLISTFIELDTYPES.noType,
            emptyText: 'No plan'
          });
        }
      },
      isOwnerOrStaff: function(customer) {
        if (this.currentUserIsStaff()) return true;
        for (var i = 0; i < customer.owners.length; i++) {
          if (this.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
      },
      currentUserIsStaff: function() {
        return this.currentUser.is_staff;
      },
      afterInstanceRemove: function(intance) {
        $rootScope.$broadcast('refreshCustomerList', {model: intance, remove: true});
        this._super(intance);
      },
      afterGetList: function() {
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('plans') == -1) {
          for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if (item.plan) {
              item.plan_name = item.plan.name;
            }
          }
        }
      },
    });

    controllerScope.__proto__ = new CustomerController();

  }

  angular.module('ncsaas')
    .controller('CustomerDetailUpdateController', [
      'baseControllerDetailUpdateClass',
      'customersService',
      'customerImageService',
      'usersService',
      'Flash',
      'ENV',
      '$stateParams',
      '$rootScope',
      '$q',
      'resourcesCountService',
      'alertsService',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController(
    baseControllerDetailUpdateClass,
    customersService,
    customerImageService,
    usersService,
    Flash,
    ENV,
    $stateParams,
    $rootScope,
    $q,
    resourcesCountService,
    alertsService
    ) {
    var controllerScope = this;
    var CustomerController = baseControllerDetailUpdateClass.extend({
      activeTab: 'resources',
      files: [],
      canEdit: false,

      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('refreshCounts', this.setCounters.bind(controllerScope));
        this._super();
        this.detailsState = 'organizations.details';
        this.currentUser = usersService.currentUser;

        this.detailsViewOptions = {
          title: 'Organization',
          activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
          hasLogo: true,
          listState: 'organizations.list',
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name',
              emptyText: 'Add name'
            },
            {
              fieldKey: 'contact_details',
              isEditable: true,
              className: 'details',
              emptyText: 'Add contact details'
            }
          ],
          tabs: [
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts'
            },
            {
              title: 'Resources',
              key: 'resources',
              viewName: 'tabResources'
            },
            {
              title: 'Projects',
              key: 'projects',
              viewName: 'tabProjects'
            },
            {
              title: 'Providers',
              key: 'providers',
              viewName: 'tabServices'
            }
          ]
        };
      },

      isOwnerOrStaff: function(customer) {
        if (this.currentUser.is_staff) return true;
        for (var i = 0; i < customer.owners.length; i++) {
          if (this.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
      },

      afterActivate: function() {
        $rootScope.$broadcast('adjustCurrentCustomer', this.model);

        controllerScope.canEdit = controllerScope.isOwnerOrStaff(controllerScope.model);
        controllerScope.updateImageUrl();

        this.setCounters();
      },

      setCounters: function() {
        var vm = this;
        var query = angular.extend(alertsService.defaultFilter, {aggregate: 'customer', uuid: vm.model.uuid});

        $q.all([
          resourcesCountService.alerts(query),
          resourcesCountService.resources({'customer_uuid': vm.model.uuid}),
          resourcesCountService.projects({'customer': vm.model.uuid}),
          resourcesCountService.services({'customer_uuid': vm.model.uuid})
        ]).then(function(responses) {
          vm.detailsViewOptions.tabs[0].count = responses[0];
          vm.detailsViewOptions.tabs[1].count = responses[1];
          vm.detailsViewOptions.tabs[2].count = responses[2];
          vm.detailsViewOptions.tabs[3].count = responses[3];
        });
      },

      updateImageUrl: function() {
        controllerScope.imageUrl = controllerScope.model.image || ENV.defaultCustomerIcon;
      },

      uploadImage: function() {
        customerImageService.create({
          uuid: controllerScope.model.uuid,
          file: controllerScope.files[0]
        }).then(function (response) {
          controllerScope.files = [];
          controllerScope.model.image = response.data.image;
          controllerScope.updateImageUrl();
          Flash.create('success', 'Organization image is uploaded');
        }, function (response) {
          Flash.create('warning', 'Unable to upload image');
        });
      },

      deleteImage: function() {
        controllerScope.model.image = null;
        customerImageService.delete({
          uuid: controllerScope.model.uuid
        }).then(function (response) {
          Flash.create('success', 'Organization image is deleted');
          controllerScope.model.image = null;
          controllerScope.updateImageUrl();
        }, function (response) {
          Flash.create('warning', 'Unable to delete image');
        });
      },
      update: function(data, fieldName) {
        var d = $q.defer();
        if (data || fieldName != 'name') {
          return this._super();
        }
        d.resolve('This field is required.');
        return d.promise;
      },
      afterUpdate: function() {
        this.successFlash('Organization {} is updated'.replace('{}', controllerScope.model.name));
        $rootScope.$broadcast('refreshCustomerList', {model: this.model, update: true});
      }
    });

    controllerScope.__proto__ = new CustomerController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerAddController',
    ['customersService', 'baseControllerAddClass', '$rootScope', CustomerAddController]);

  function CustomerAddController(customersService, baseControllerAddClass, $rootScope) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'organizations.list';
        this.detailsState = 'organizations.details';
        this.redirectToDetailsPage = true;
      },
      afterSave: function() {
        $rootScope.$broadcast('refreshCustomerList', {model: this.instance, new: true, current: true});
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerServiceTabController', [
      '$stateParams',
      'baseServiceListController',
      'joinService',
      'servicesService',
      'usersService',
      'blockUI',
      CustomerServiceTabController
    ]);

  function CustomerServiceTabController(
    $stateParams, baseServiceListController, joinService, servicesService, usersService, blockUI) {
    var controllerScope = this;
    var Controller = baseServiceListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = joinService;
        this.service.defaultFilter.customer_uuid = $stateParams.uuid;
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'details',
            title: 'Settings'
          }
        ];
        this._super();
        this.entityOptions.list[0].type = 'editable';
        this.entityOptions.entityData.expandable = true;
      },
      showMore: function(service) {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          service.editable = user.is_staff || !service.shared;
          if (!service.editable) {
            return;
          }
          if (service.values) {
            return;
          }
          var myBlockUI = blockUI.instances.get(service.uuid);
          myBlockUI.start();

          vm.service.getOptions(service.service_type).then(function(options) {
            service.options = options;
            service.fields = vm.getFields(options);

            servicesService.$get(null, service.settings).then(function(settings) {
              service.values = settings;
              myBlockUI.stop();
            });
          });
        });
      },
      getFields: function(options) {
        var fields = [];
        var blacklist = ['name', 'customer', 'settings'];
        for (var name in options) {
          var option = options[name];
          if (!option.read_only && blacklist.indexOf(name) == -1) {
            option.name = name;
            fields.push(option);
          }
        }
        return fields;
      },
      afterGetList: function() {
        var vm = this;
        var service_type = $stateParams.providerType;
        var uuid = $stateParams.providerUuid;

        if (service_type && uuid) {
          var item = vm.findItem(service_type, uuid);
          if (item) {
            // Move found element to the start of the list for user's convenience
            vm.list.splice(vm.list.indexOf(item), 1);
            vm.list.unshift(item);
            vm.showMore(item);
            item.expandItemOpen = true;
          } else {
            this.service.$get(service_type, uuid).then(function(provider) {
              vm.list.unshift(provider);
              vm.showMore(provider);
              provider.expandItemOpen = true;
            });
          }
        }
      },
      findItem: function(service_type, uuid) {
        for (var i = 0; i < this.list.length; i++) {
          var item = this.list[i];
          if (item.uuid == uuid && item.service_type == service_type) {
            return item;
          }
        }
      },
      updateSettings: function(service) {
        var saveService = joinService.$update(null, service.settings, service.values);
        return saveService.then(this.onSaveSuccess.bind(this, service), this.onSaveError.bind(this, service));
      },
      update: function(service) {
        var saveService = joinService.$update(null, service.url, service);
        return saveService.then(this.onSaveSuccess.bind(this), this.onSaveError.bind(this, service));
      },
      onSaveSuccess: function(service) {
        if (service) {
          this.saveRevision(service);
        }
      },
      onSaveError: function(service, response) {
        var message = '';
        for (var name in response.data) {
          message += (service.options[name] ? service.options[name].label : name) + ': ' + response.data[name];
        }
        if (message) {
          this.errorFlash('Unable to save provider. ' + message);
        }
      },
      hasChanged: function(model) {
        if (!model.values) {
          return false;
        }

        if (!model.revision) {
          this.saveRevision(model);
          return false;
        }

        return this.revisionsDiffer(model.revision, model.values.toJSON());
      },
      saveRevision: function(model) {
        if (model.values) {
          model.revision = model.values.toJSON();
        }
      },
      revisionsDiffer: function(revision1, revision2) {
        for (var name in revision1) {
          var val1 = revision1[name] ? revision1[name] : '';
          var val2 = revision2[name] ? revision2[name] : '';
          if (val1 != val2) {
            return true;
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();


(function() {

  angular.module('ncsaas')
    .controller('CustomerProjectTabController', [
      'BaseProjectListController', '$stateParams', 'projectsService', CustomerProjectTabController]);

  function CustomerProjectTabController(BaseProjectListController, $stateParams, projectsService) {
    var controllerScope = this;
    var Controller = BaseProjectListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectsService;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.service.filterByCustomer = false;
        this._super();
        this.entityOptions.entityData.title = '';
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('CustomersResourceTabController', [
      '$stateParams',
      'baseResourceListController',
      'resourcesService',
      'ENTITYLISTFIELDTYPES',
      CustomersResourceTabController
    ]);

  function CustomersResourceTabController(
    $stateParams,
    baseResourceListController,
    resourcesService,
    ENTITYLISTFIELDTYPES
  ) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        // resource endpoint is using a different customer filter name
        this.service.filterByCustomer = false;
        this.service.defaultFilter.customer_uuid = $stateParams.uuid;
        this._super();
        this.entityOptions.list.push({
          name: 'Project',
          propertyName: 'project_name',
          link: 'projects.details({uuid: entity.project_uuid})',
          type: ENTITYLISTFIELDTYPES.name
        });
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerAlertsListController', [
      'BaseAlertsListController',
      'currentStateService',
      '$scope',
      CustomerAlertsListController]);

  function CustomerAlertsListController(BaseAlertsListController, currentStateService, $scope) {
    var controllerScope = this;
    var controllerClass = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        $scope.$on('currentCustomerUpdated', this.onCustomerUpdate.bind(this));
      },

      onCustomerUpdate: function() {
        this.getList();
      },

      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        filter = filter || {};
        return currentStateService.getCustomer().then(function(customer) {
          vm.service.defaultFilter.aggregate = 'customer';
          vm.service.defaultFilter.uuid = customer.uuid;
          vm.service.defaultFilter.opened = true;
          fn(filter);
        })
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();
