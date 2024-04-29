describe('Users', () => {
  beforeEach(() => {
    cy.mockChecklists()

      .intercept('GET', '/api/configuration/', {
        fixture: 'support/configuration.json',
      })
      .intercept('GET', '/api/events/', [])
      .intercept('GET', '/api/roles/', { fixture: 'roles.json' })

      .intercept('GET', '/api/users/me/', {
        fixture: 'support/me.json',
      })

      .intercept('GET', '/api/customers/**', {
        fixture: 'support/customers.json',
      })

      .intercept('GET', '/api/users/?page=1&page_size=10&query=Tara%20Pierce', {
        fixture: 'support/user-search-by-name.json',
      })

      .intercept(
        'GET',
        '/api/users/?page=1&page_size=10&query=0024c6a7885940bbb156e82073bc0244',
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept(
        'GET',
        '/api/users/?page=1&page_size=10&customer_uuid=895e38d197e748459189f19285119edf',
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept('GET', '/api/users/?page=1&page_size=10&is_staff=true', {
        fixture: 'support/users.json',
      })

      .intercept('GET', '/api/users/?page=1&page_size=10&role=&status=true', {
        fixture: 'support/users.json',
      })

      .intercept(
        'GET',
        '/api/users/?page=1&page_size=10&query=TaraPierce%40example.com',
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept('GET', '/api/users/?page=1&page_size=10', {
        fixture: 'support/users.json',
      })
      .as('getUsers')

      .setToken()

      .visit('/administration/users/')
      .waitForPage();
  });

  it('renders title', () => {
    cy.get('.card-title.h5').contains('Users').should('exist');
  });

  it('renders user items', () => {
    cy.get('table tbody tr').should('have.length', 10);
  });

  it('should full name search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('.form-control-solid.ps-10.form-control[placeholder="Search ..."]')
        .type('Tara Pierce')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should username search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('.form-control-solid.ps-10.form-control[placeholder="Search ..."]')
        .type('0024c6a7885940bbb156e82073bc0244')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should organization search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.selectTableFilter('Organization', 'Allen-Rodriguez', true, true);
      cy.get('table tbody tr').should('have.length', 1);
    });
  });

  it('should email search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('.form-control-solid.ps-10.form-control[placeholder="Search ..."]')
        .type('TaraPierce@example.com')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should search works correctly using account role', () => {
    cy.wait('@getUsers').then(() => {
      cy.selectTableFilter('Role', null);
      cy.get('table tbody tr').should('have.length', 10);
    });
  });

  it('should search works correctly using account status', () => {
    cy.wait('@getUsers').then(() => {
      cy.selectTableFilter('Status', null);
      cy.get('table tbody tr').should('have.length', 10);
    });
  });

  it('should open details modal when click details button', () => {
    cy.contains('button', 'Details')
      .click({ force: true })
      .get('.modal-title')
      .contains('User details of Tara Pierce')
      .should('be.visible', true)
      .get('.modal-footer')
      .contains('button', 'Done')
      .should('be.visible', true)
      .click();
  });
});
