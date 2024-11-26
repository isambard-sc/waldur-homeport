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
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/users/**',
        {
          fixture: 'customers/customer_users.json',
        },
      )
      .intercept('POST', '/api/projects/*/delete_user/', {})

      .intercept(
        'POST',
        `/api/customers/bf6d515c9e6e445f9c339021b30fc96b/delete_user/`,
        {},
      )
      .as('deleteCustomerPermission')

      .intercept(
        'POST',
        `/api/customers/bf6d515c9e6e445f9c339021b30fc96b/update_user/`,
        {},
      )
      .as('updateCustomerPermission')

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
    cy.get('.row-actions')
      .first()
      .within(() => {
        cy.get('button').click({ force: true });
        cy.get('.dropdown-menu .dropdown-item')
          .contains('Details')
          .click({ force: true });
      });
    cy.get('.modal-title').contains('User details');
    cy.get('.modal-content').get('table').should('be.visible');
    cy.wait('@getUserDetails');
  });

  it('Allows to remove team member', () => {
    cy.get('.row-actions')
      .first()
      .within(() => {
        cy.get('button').click({ force: true });
        cy.get('.dropdown-menu .dropdown-item')
          .contains('Remove')
          .click({ force: true });
      });

    cy.get('.modal button').contains('Yes').click();

    // Notification should be shown
    cy.get("[data-testid='notification']")
      .contains('Team member has been removed.')
      .wait('@deleteCustomerPermission');
  });

  it('Allows to edit permission', () => {
    cy.get('.row-actions')
      .first()
      .within(() => {
        cy.get('button').click({ force: true });
        cy.get('.dropdown-menu .dropdown-item')
          .contains('Edit')
          .click({ force: true });
      });
    cy.get('.modal-title')
      .contains('Edit organization member')
      .get('.modal-content')

      // Open Role dropdown
      .get('.modal label')
      .contains('Role')
      .next()
      .get('.modal [class*="-control"]')
      .first()
      .click(0, 0, { force: true })

      .get('.modal button')
      .contains('Save')
      .click()

      .wait('@updateCustomerPermission');
  });
});
