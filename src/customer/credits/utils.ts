export const serializeCustomerCredit = (formData) => ({
  ...formData,
  customer: formData.customer.url,
  offerings: formData.offerings
    ? formData.offerings.map((offering) => offering.url)
    : undefined,
});
