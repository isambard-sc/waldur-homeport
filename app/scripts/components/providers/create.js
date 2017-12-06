import template from './create.html';

const providerCreate = {
  template: template,
  controller: ServiceAddController,
  controllerAs: 'ServiceAdd'
};

export default providerCreate;

// TODO: Migrate to ES6 class, explicitly specify form field configuration for each provider.
// @ngInject
function ServiceAddController(
  servicesService,
  usersService,
  joinService,
  currentStateService,
  baseControllerAddClass,
  CategoriesService,
  ENV,
  $rootScope,
  $state,
  $scope,
  $q,
  ncUtils) {
  let controllerScope = this;
  let ServiceController = baseControllerAddClass.extend({
    predefinedOptions: {
      available_for_all: true
    },

    blacklistedOptions: ['name', 'images_regex'],
    secretFields: ['token', 'password'],
    optionTypes: ['string', 'choice', 'boolean', 'url', 'file upload'],

    extraOptions: {
      OpenStack: {
        is_admin: {
          type: 'boolean'
        },
        tenant_name: {
          help_text: ''
        },
        backend_url: {
          help_text: ''
        },
        username: {
          help_text: ''
        }
      },
      DigitalOcean: {
        token: {
          required: true
        }
      }
    },

    optionsOrder: {
      OpenStack: [
        'backend_url',
        'username',
        'password',
        'tenant_name',
        'external_network_id',
        'availability_zone',
        'latitude',
        'longitude',
      ]
    },

    errors: {},

    init: function() {
      this.service = joinService;
      this.controllerScope = controllerScope;
      this.successMessage = gettext('Provider has been created.');
      if (ENV.onlyStaffManagesServices && !usersService.currentUser.is_staff) {
        $state.go('invalidRoutePage');
      }
      let vm = this;
      $scope.$watch('ServiceAdd.serviceChoice', function(choice) {
        if (!choice) {
          return;
        }
        let service = vm.services[choice.name];
        if (service) {
          vm.setModel(service);
        }
      });
      this._super();
    },
    setModel: function(model) {
      this.model = angular.copy(model);
      this.model.serviceName = model.name;
      this.loadingService = true;
      this.getOptions(model.name).then(function(options) {
        this.model.options = angular.copy(options);
        angular.forEach(options, function(option) {
          if (option.default_value) {
            option.value = option.default_value;
          }
        });
      }.bind(this)).finally(function() {
        this.loadingService = false;
      }.bind(this));
      controllerScope.errors = {};
    },

    fillPredefinedOptions: function(data) {
      angular.forEach(this.predefinedOptions, function(value, key) {
        data[key] = value;
      });
    },

    activate: function() {
      this.loadingCustomer = true;
      $q.all([this.getCustomer(), this.getServices()]).finally(function() {
        this.loadingCustomer = false;
      }.bind(this));
    },

    getCustomer: function() {
      let vm = this;
      return currentStateService.getCustomer().then(function(customer) {
        vm.customer = customer;
        if (ncUtils.isCustomerQuotaReached(customer, 'service')) {
          $state.go('errorPage.limitQuota');
        }
      });
    },

    getServices: function() {
      let vm = this;
      return servicesService.getServicesList().then(function(services) {
        vm.choices = [];
        angular.forEach(services, function(service, name) {
          service.name = name;
          let category = CategoriesService.getServiceCategories().filter(function(category) {
            return category.services.indexOf(name) !== -1;
          })[0];
          if (category) {
            vm.choices.push({
              name: name,
              category: category.name
            });
          }
        });
        vm.serviceChoice = vm.choices[0];
        vm.services = services;
      });
    },

    getOptions: function(service_type) {
      return joinService.getOptions(service_type).then(function(options) {
        let items = [];
        angular.forEach(options, function(option, key) {
          if (this.isValidOption(option, key)) {
            option.key = key;
            option.secret = this.secretFields.indexOf(key) !== -1;
            let extra = this.extraOptions[service_type];
            if (extra) {
              option = angular.extend(option, extra[key]);
            }
            items.push(option);
          }
        }.bind(this));
        return this.orderOptions(service_type, items);
      }.bind(this));
    },

    orderOptions: function(service_type, options) {
      let ordering = this.optionsOrder[service_type];
      if (!ordering) {
        return options;
      }
      return options.sort(function(x, y) {
        return ordering.indexOf(x.key) - ordering.indexOf(y.key);
      });
    },

    isValidOption: function(option, key) {
      // Skip non supported option types
      return (
        this.optionTypes.indexOf(option.type) !== -1 &&
        this.blacklistedOptions.indexOf(key) === -1 &&
        !this.predefinedOptions[key]
      );
    },

    saveInstance: function() {
      let data = this.getData();
      let vm = this;
      return this.service.create(this.model.url, data).then(function(response) {
        vm.instance = response;
        $rootScope.$broadcast('refreshProjectList');
        $rootScope.$broadcast('customerBalance:refresh');
      });
    },
    getFilename: ncUtils.getFilename,
    getData: function() {
      let data = {};
      for (let i = 0; i < this.model.options.length; i++) {
        let option = this.model.options[i];
        let value = option.value;
        if (angular.isUndefined(value)) {
          continue;
        }
        if (ncUtils.isFileOption(option)) {
          if (value.length !== 1 || !ncUtils.isFileValue(value[0])) {
            continue;
          }
          value = value[0];
        }
        data[option.key] = value;
      }
      data.customer = this.customer.url;
      data.name = this.model.serviceName;
      this.fillPredefinedOptions(data);
      return data;
    },

    successRedirect: function() {
      $state.go('organization.providers', {
        uuid: this.customer.uuid,
        providerType: this.instance.service_type,
        providerUuid: this.instance.uuid
      });
    },

    cancel: function() {
      $state.go('organization.providers', {
        uuid: this.customer.uuid
      });
    },

    isDisabled: function() {
      if (!this.model || !this.model.options) {
        return true;
      }
      for (let i = 0; i < this.model.options.length; i++) {
        let option = this.model.options[i];
        if (angular.isUndefined(option.value) && option.required) {
          return true;
        }
      }
      return false;
    }
  });

  controllerScope.__proto__ = new ServiceController();
}
