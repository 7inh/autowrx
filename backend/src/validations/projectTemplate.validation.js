// Copyright (c) 2025-2026 Eclipse Foundation.
// SPDX-License-Identifier: MIT

const Joi = require('joi');
const { objectId } = require('./custom.validation');

const codeSchema = Joi.alternatives().try(
  Joi.string().max(500000),
  Joi.array().max(500).items(Joi.object().unknown(true).max(50)),
);

const list = {
  query: Joi.object().keys({
    name: Joi.string(),
    language: Joi.string(),
    visibility: Joi.string().valid('public', 'private'),
    is_default: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const get = {
  params: Joi.object().keys({ id: Joi.string().custom(objectId) }),
};

const create = {
  body: Joi.object().keys({
    name: Joi.string().required().max(255),
    description: Joi.string().max(2000).allow(''),
    language: Joi.string().required(),
    code: codeSchema.required(),
    visibility: Joi.string().valid('public', 'private').default('public'),
    is_default: Joi.boolean().default(false),
  }),
};

const update = {
  params: Joi.object().keys({ id: Joi.string().custom(objectId) }),
  body: Joi.object()
    .keys({
      name: Joi.string().max(255),
      description: Joi.string().max(2000).allow(''),
      language: Joi.string(),
      code: codeSchema,
      visibility: Joi.string().valid('public', 'private'),
      is_default: Joi.boolean(),
    })
    .min(1),
};

const remove = {
  params: Joi.object().keys({ id: Joi.string().custom(objectId) }),
};

module.exports = { list, get, create, update, remove };
