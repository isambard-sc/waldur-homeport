xdescribe('Broadcast', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()

      .intercept('GET', '/api/broadcast_messages/?page=1&page_size=10', {
        fixture: 'support/notifications.json',
      })
      .as('getNotifications')
      .intercept(
        'GET',
        '/api/customers/?name=&page_size=10&has_resources=true&field=name&field=uuid&o=name',
        {
          fixture: 'support/customers.json',
        },
      )
      .intercept(
        'GET',
        '/api/projects/?name=&field=name&field=uuid&o=name&page=1&page_size=10',
        {
          fixture: 'support/projects.json',
        },
      )
      .intercept(
        'GET',
        '/api/marketplace-offerings/?field=name&field=uuid&field=url&field=category_title&field=thumbnail&o=name&state=Active&name=&shared=true&page=1&page_size=10',
        {
          fixture: 'support/marketplace-offerings.json',
        },
      )
      .intercept('POST', '/api/broadcast_messages/dry_run/', {
        statusCode: 200,
      })
      .intercept('POST', '/api/broadcast_messages/', {
        fixture: 'support/notifications-single.json',
      })
      .setToken()

      .visit('/support/broadcast/')
      .waitForSpinner();
  });

  it('renders title', () => {
    cy.get('.page-title h1').contains('Broadcast').should('exist');
  });

  it('Create a broadcast', () => {
    cy.wait('@getNotifications').then(() => {
      cy.get('button')
        .contains('Create')
        .click()
        .get('input[name="subject"]')
        .type('Test')
        .get('textarea[name="body"]')
        .type('Test')
        .get('.modal-footer > .btn-primary')
        .click()
        .get('tbody > :nth-child(1) > :nth-child(3)')
        .contains('Test')
        .should('exist');
    });
  });

  it('should expand items when click on arrow icon', () => {
    cy.get('tbody > :nth-child(1) > :nth-child(1)')
      .click()
      .get(':nth-child(2) > td > :nth-child(1)')
      .contains('Test');
  });

  it('should refresh button work correctly', () => {
    cy.wait('@getNotifications').then(() => {
      cy.get('a').contains('Refresh').click().get('.spinner-container > .fa');
    })
  });
});
