var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  users = [auth.getUser('Charlie'), auth.getUser('Walter')],
  testData = [
    {
      email: 'testemail1@example.com',
      emailFail: 'testemail1example.com'
    },
    {
      email: 'testemail2@example.com',
      emailFail: 'testemail2@examplecom'
    },
  ];
for(var i=0; i < users.length; i++) {
  var user = users[i],
    data = testData[i],
    name = helpers.getUUID();

  (function(user, data, name) {
    describe('Test ' + user.username + ' can go to "profile" page:', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to profile', function() {
        element(by.css('header > nav > ul.nav-list.context > li:nth-child(4) > a')).click();
        element(by.cssContainingText('ul.nav-list.context > li:nth-child(4) > ul > li > a', 'Profile')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/');
        expect(element(by.css('h2.app-title')).getText()).toContain(user.username);
      });

      // XXX: This test changes user email, ideally we have to create new user and change his email.
      it('I should be able to edit profile', function() {
        var currentEmail = element(by.css('.profile-view .content a.ng-binding')).getText();

        function setEmail(email) {
          element(by.model('UpdateProfile.model.email')).clear();
          element(by.model('UpdateProfile.model.email')).sendKeys(email);
          element(by.cssContainingText('.button-apply', 'Save')).click();
        }

        element(by.cssContainingText('.actions-button a.button', 'actions')).click();
        element(by.cssContainingText('a.button-simple', 'Edit profile')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/edit/');
        expect(element(by.css('.app-title')).getText()).toContain(user.username);
        setEmail(data.emailFail);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/edit/');
        expect(element(by.css('.profile-view .error')).getText()).toEqual('Enter a valid email address.');
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(user, data, name);

}

var users = [
  auth.getUser('Walter')
];

for(var i=0; i < users.length; i++) {
  var user = users[i];

  (function(user) {
    describe('Test ' + user.username + ' can go to delete account:', function() {
      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      // TODO this test can be run when functionality of adding new user will be available.
      xit('I should be able to delete my account', function() {
        element(by.css('li.dropdown.user-box a')).click();
        element(by.cssContainingText('li.dropdown.user-box ul li:nth-child(1) a', 'Profile')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/');
        expect(element(by.css('.profile-name')).getText()).toContain(user.username);

        element(by.css('ul.controls.pull-right > li:nth-child(3) > a')).click();
        browser.switchTo().alert().accept();
        expect(element(by.css('.tour-box .take-a-tour')).getText()).toEqual('Sign me up!');
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(user);
}
