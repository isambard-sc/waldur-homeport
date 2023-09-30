describe('Team', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/counters/',
        {
          fixture: 'marketplace/counters.json',
        },
      )
      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/users/?page=1&page_size=10&o=concatenated_name',
        {
          fixture: 'customers/customer_users.json',
        },
      )
      .intercept('POST', '/api/projects/*/delete_user/', {})

      .intercept('POST', `/api/customers/bf6d515c9e6e445f9c339021b30fc96b/delete_user/`, {})
      .as('deleteCustomerPermission')

      .intercept('POST', '/api/projects/*/add_user/', {})

      .intercept('GET', '/api/users/a37feb500aa0445b8dd45ae43a48b6e5/', {
        fixture: 'users/alice.json',
      })
      .as('getUserDetails')

      .visit('/organizations/6983ac22f2bb469189311ab21e493359/users/')
      .get('.loading-title')
      .should('not.exist')
      .waitForSpinner();
  });

  it('Allows to view permission details', () => {
    cy.get('.btn-group button').contains('Details').click({ force: true });
    cy.get('.modal-title').contains('User details');
    cy.get('.modal-content').within(() => {
      cy.waitForSpinner().get('table').should('be.visible');
    });
    cy.wait('@getUserDetails');
  });

  it('Allows to remove team member', () => {
    cy.get('.btn-group button')
      .contains('Remove')
      .click({ force: true })
      .get('button')
      .contains('Yes')
      .click();

    // Notification should be shown
    cy.get("[data-testid='notification']")
      .contains('Team member has been removed.')
      .wait('@deleteCustomerPermission');
  });

  it('Allows to edit permission', () => {
    cy.get('.btn-group button').contains('Edit').click({ force: true });
    cy.get('.modal-title')
      .contains('Edit team member')
      .get('.modal-content')
      .get('.checkbox')
      .contains('Organization owner')
      .click()

      // Open Role dropdown
      .get('td.role-column input')
      .first()
      .click({ force: true })
      .type('{enter}', {force: true})

      .get('button')
      .contains('Save')
      .click()

      .wait('@deleteCustomerPermission');
  });
});
