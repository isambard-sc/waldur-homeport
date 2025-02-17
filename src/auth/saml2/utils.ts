export const redirectPost = (url: string, data: object) => {
  const form = document.createElement('form');
  document.body.appendChild(form);
  form.method = 'POST';
  form.action = url;
  for (const name in data) {
    if (Object.prototype.hasOwnProperty.call(data, name)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = data[name];
      form.appendChild(input);
    }
  }
  form.submit();
};
