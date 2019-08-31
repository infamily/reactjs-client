import queryString from 'query-string';

export const queryStringStringify = queryDict => {
  const queryDictOriginal = queryDict;
  const queryDictUpdated = {};
  Object.keys(queryDictOriginal).forEach(key => {
    if (
      queryDictOriginal[key] !== undefined &&
      queryDictOriginal[key] !== '' &&
      queryDictOriginal[key] !== null
    ) {
      queryDictUpdated[key] = queryDictOriginal[key];
    }
  });

  return queryString.stringify(queryDictUpdated);
};
