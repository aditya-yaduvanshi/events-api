const {Schema, model} = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 64,
    },
    about: {
      type: String,
      required: true,
      maxlength: 100,
    },
    avatar: String,
  },
  {_id: false}
);

const ResourceSchema = new Schema(
  {
    resourceType: {
      type: String,
      required: true,
      maxlength: 30,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {_id: false}
);

const EventSchema = new Schema(
  {
    title: {
      type: String,
      maxlength: 100,
      required: true,
    },
    link: {
      type: String,
      maxlength: 500,
    },
    when: Date,
    start: Date,
    end: Date,
    about: {
      type: String,
      maxlength: 1000,
    },
    speakers: {
      type: [UserSchema],
      validate: [
        (arr) => arr.length < 100 && arr.length >= 1,
        "should be between 1 and 100",
      ],
    },
    moderators: {
      type: [UserSchema],
      validate: [(arr) => arr.length < 100, "max limit exceeded i.e. 100"],
    },
    resources: {
      type: [ResourceSchema],
      validate: [(arr) => arr.length < 5000, "max limit exceeded i.e. 5000"],
    },
    joiningInfo: {
      type: String,
      maxlength: 500,
    },
    organisers: {
      type: [
        {
          type: String,
          maxlength: 100,
        },
      ],
      validate: [(arr) => arr.length < 100, "max limit exceeded i.e. 100"],
    },
    tags: {
      type: [
        {
          type: String,
          maxlength: 20,
        },
      ],
      validate: [(arr) => arr.length < 100, "max limit exceeded i.e. 100"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "archive"],
      default: "draft",
    },
  },
  {timestamps: true}
);

const Events = model("events", EventSchema);

module.exports = Events;
