// @ngInject
export default function ApplicationsService(ENV, $http, baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/applications/';
    }
  });
  return new ServiceClass();
}
