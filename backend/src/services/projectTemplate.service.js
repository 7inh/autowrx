// Copyright (c) 2025-2026 Eclipse Foundation.
// SPDX-License-Identifier: MIT

const httpStatus = require('http-status');
const { ProjectTemplate } = require('../models');
const ApiError = require('../utils/ApiError');

const create = async (body) => {
  if (body.is_default) {
    await ProjectTemplate.updateMany({ is_default: true }, { is_default: false });
  }
  return ProjectTemplate.create(body);
};

const query = async (filter, options, { isAdmin = false } = {}) => {
  if (!isAdmin && !filter.visibility) {
    filter.visibility = 'public';
  }
  return ProjectTemplate.paginate(filter, options);
};

const getById = async (id) => {
  const doc = await ProjectTemplate.findById(id);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'ProjectTemplate not found');
  return doc;
};

const updateById = async (id, updateBody) => {
  const doc = await getById(id);
  if (updateBody.is_default) {
    await ProjectTemplate.updateMany({ is_default: true, _id: { $ne: id } }, { is_default: false });
  }
  Object.assign(doc, updateBody);
  await doc.save({ validateModifiedOnly: true });
  return doc;
};

const removeById = async (id) => {
  const doc = await getById(id);
  await doc.deleteOne();
  return doc;
};

module.exports = { create, query, getById, updateById, removeById };
