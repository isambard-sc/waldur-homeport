describe('Issue details view', { testIsolation: false }, () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/marketplace-provider-offerings/', {
        fixture: 'marketplace/offerings.json',
      })
      .intercept(
        'GET',
        '/api/support-issues/c675f0e7738249f5a859037da28fbd2e/',
        {
          fixture: 'support/issue.json',
        },
      )
      .intercept(
        'GET',
        '/api/support-attachments/?issue=https%3A%2F%2Fexample.com%2Fapi%2Fsupport-issues%2Fc675f0e7738249f5a859037da28fbd2e%2F',
        [],
      )
      .as('getAttachments')
      .intercept(
        'GET',
        '/api/support-comments/?issue=https%3A%2F%2Fexample.com%2Fapi%2Fsupport-issues%2Fc675f0e7738249f5a859037da28fbd2e%2F',
        {
          fixture: 'support/comments.json',
        },
      )
      .as('getComments');
  });

  it('renders attachments section', () => {
    cy.visit('/support/issue/c675f0e7738249f5a859037da28fbd2e/');
    cy.get('.card-title.h5')
      .contains('Attachments')
      .should('exist')
      .wait('@getAttachments');
  });

  it('renders list of comments', () => {
    cy.get('.card-title').contains('Comments').should('exist');
    cy.get('.issue-comment').should('exist').should('have.length', 1);
  });

  it('submits new comment', () => {
    cy.fixture('support/comments.json').then((comments) => {
      const comment = comments[0];
      comment.uuid = 'c2';
      cy.intercept(
        'POST',
        '/api/support-issues/c675f0e7738249f5a859037da28fbd2e/comment/',
        comment,
      ).as('createComment');
    });
    cy.get('.card-title')
      .contains('Comments')
      .parents('.card')
      .within(() => {
        cy.get('button').contains('Add comment').click();
      });
    cy.get('.modal textarea')
      .type('Pick issue beyond role often account offer.')
      .get('.modal button')
      .contains('Confirm')
      .click()
      .wait('@createComment');
  });
});
