function formatUserData(raw) {
  const user = raw;
  const id = raw.url.match(/users\/(.*)\//)[1]; // get user id
  user.token = raw.auth_token.match(/tokens\/(.*)\//)[1]; // get user token
  user.id = parseInt(id, 10);
  return user;
}

export default {
  formatUserData,
}