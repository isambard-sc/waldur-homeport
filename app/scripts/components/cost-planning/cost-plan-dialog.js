import template from './cost-plan-dialog.html';

// Although it is not used directly as these labels come from backend
// they are listed explicitly in order to extract labels for translation.
const PRESET_VARIANTS = [
  gettext('Small'),
  gettext('Medium'),
  gettext('Large'),
];

const costPlanDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
  controller: class CostPlanDialogController {
    constructor(costPlansService, costPresetsService, certificationsService, $q) {
      // @ngInject
      this.costPlansService = costPlansService;
      this.costPresetsService = costPresetsService;
      this.certificationsService = certificationsService;
      this.$q = $q;
    }

    $onInit() {
      this.loadData();

      this.customer = this.resolve.customer;
      if (this.resolve.plan) {
        this.plan = angular.copy(this.resolve.plan);
      } else {
        this.plan = {
          name: gettext('New plan'),
          items: []
        };
        this.addItem();
      }
    }

    loadData() {
      this.loading = true;
      this.$q.all([
        this.costPresetsService.getAll().then(presets => this.presets = presets),
        this.certificationsService.getAll().then(certifications => this.certifications = certifications),
      ]).finally(() => this.loading = false);
    }

    addItem() {
      this.plan.items.push({
        quantity: 1,
        variant: 'Small'
      });
    }

    deleteItem(item) {
      const index = this.plan.items.indexOf(item);
      this.plan.items.splice(index, 1);
    }

    save() {
      const items = this.getValidItems();
      let plan = this.costPlansService.$create();
      plan.name = this.plan.name;
      plan.customer = this.customer.url;
      plan.items = items.map(item => ({
        preset: item.preset.url,
        quantity: item.quantity,
      }));
      plan.certifications = this.plan.certifications.map(({url}) => ({url}));

      let promise;
      if (this.resolve.plan) {
        plan.url = this.plan.url;
        promise = this.costPlansService.update(plan);
      } else {
        promise = plan.$save();
      }

      this.saving = true;
      return promise
        .then(() => this.close())
        .finally(() => this.saving = false);
    }

    getTotalConsumption() {
      let cores = 0, ram = 0, disk = 0;
      const items = this.getValidItems();
      angular.forEach(items, item => {
        cores += item.preset.cores * item.quantity;
        ram += item.preset.ram * item.quantity;
        disk += item.preset.storage * item.quantity;
      });
      return {cores, ram, disk};
    }

    getValidItems() {
      return this.plan.items.filter(item => item.preset);
    }
  }
};

export default costPlanDialog;
