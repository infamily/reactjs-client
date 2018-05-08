import axios from 'axios';
import langService from 'services/lang.service';
import serverService from 'services/server.service';

async function getTopic(id) {
  try {
    const getTopic = lang =>
      axios.get(`${serverService.api}/topics/${id}/?lang=${lang || ''}`);
    const _topic = await getTopic(' ');

    const { current } = langService;
    const { languages } = _topic.data;

    const index = languages.indexOf(current);
    const lang = languages[index > -1 ? index : 0];

    const { data } = await getTopic(lang);
    data.lang = lang;
    return data;
  } catch (e) {
    console.error(e);
  }
}

async function getCategory(id) {
  try {
    const getCategoryByLang = lang =>
      axios.get(
        `${serverService.api}/types/${id}/?category=1&lang=${lang || ''}`
      );
    const _category = await getCategoryByLang(' ');

    const { current } = langService;
    const { languages } = _category.data;

    const index = languages.indexOf(current);
    const lang = languages[index > -1 ? index : 0];

    const { data } = await getCategoryByLang(lang);
    data.lang = lang;
    return data;
  } catch (e) {
    console.error(e);
  }
}

async function getParents(parents) {
  const formatted = [];

  for (const link of parents) {
    const id = link.match(/topics\/(\d+)/)[1];
    const topic = await getTopic(id);
    const { title, url } = topic;
    formatted.push({ label: title, value: title, url });
  }

  return formatted;
}

async function addParent(id) {
  const topic = await getTopic(id);
  const { title, url, type } = topic;
  const parent = { label: title, value: title, url, type };

  return parent;
}

async function getCategories(categories) {
  const formatted = [];

  for (const link of categories) {
    const getTypeId = link => link.match(/types\/(\d+)/)[1];
    const category = await getCategory(getTypeId(link));
    const { name, url } = category;
    formatted.push({ label: name, value: name, url });
  }

  return formatted;
}

export async function getType(id) {
  const lang = langService.current;
  const { data } = await serverService.get(`/types/${id}/?lang=${lang}`);
  return data;
}

export default {
  getCategory,
  getTopic,
  getParents,
  getCategories,
  addParent,
  getType
};
