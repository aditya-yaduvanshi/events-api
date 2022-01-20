const router = require("express").Router(),
  Events = require("../models/events"),
  fs = require("fs");

const upload = (media, pre = "media") => {
  let ext = media.name.trim().split(".").at(-1),
    path = `static/${pre}-${Date.now().toString()}.${ext}`;
  media.mv(path, (err) => {
    if (err) throw err;
  });
  return `/${path}`;
};

const unUpload = (path) => {
  fs.unlink(String(path).replace("/", ""), (err) => {
    if (err) throw err;
  });
};

const unstructured = ["file", "audio", "video", "image", "attachment"];

router.post("/", async (req, res, next) => {
  // create new event
  try {
    let data = req.body,
      files = req.files;

    const event = new Events({
      title: data.title,
      link: data.link,
      when: data.when,
      about: data.about,
      start: data.start,
      end: data.end,
      status: data.status,
      tags: JSON.parse(data.tags),
      joiningInfo: data.joiningInfo,
      organisers: JSON.parse(data.organisers),
    });

    JSON.parse(data.speakers).forEach((speaker) => {
      let obj = {
        name: speaker.name,
        about: speaker.about,
      };

      if (speaker.avatar) {
        obj.avatar = upload(files[speaker.avatar], "avatar");
      }

      event.speakers = [...event.speakers, obj];
    });

    JSON.parse(data.moderators).forEach((moderator) => {
      let obj = {
        name: moderator.name,
        about: moderator.about,
      };

      if (moderator.avatar) {
        obj.avatar = upload(files[moderator.avatar], "avatar");
      }

      event.moderators = [...event.moderators, obj];
    });

    JSON.parse(data.resources).forEach((resource) => {
      let obj = {
        resourceType: resource.resourceType,
      };

      if (unstructured.includes(resource.resourceType)) {
        obj.content = upload(files[resource.content], "resource");
      } else {
        obj.content = resource.content;
      }

      event.resources = [...event.resources, obj];
    });

    await event.save();
    return res.sendStatus(201);
  } catch (err) {
    return res.json({error: err.message});
  }
});

router.get("/", async (req, res, next) => {
  // get list or filter events
  try {
    const events = await Events.find({
      ...req.query,
    });
    return res.json(events);
  } catch (err) {
    return res.json({error: err.message});
  }
});

router.get("/:id", async (req, res, next) => {
  // get specific event by id
  try {
    const eventId = req.params.id,
      event = await Events.findById(eventId);

    if (!event) throw new Error("event not found!");

    return res.json(event);
  } catch (err) {
    return res.json({error: err.message});
  }
});

router.put("/:id", async (req, res, next) => {
  // update specific event by id
  try {
    let data = req.body,
      files = req.files,
      eventId = req.params.id,
      event = await Events.findById(eventId);

    if (!(await event)) throw new Error("event not found!");

    event.title = data.title ?? event.title;
    event.about = data.about ?? event.about;
    event.when = data.when ?? event.when;
    event.status = data.status ?? event.status;
    event.start = data.start ?? event.start;
    event.end = data.end ?? event.end;
    event.joiningInfo = data.joiningInfo ?? event.joiningInfo;
    event.link = data.link ?? event.link;
    event.tags = data.tags ? JSON.parse(data.tags) : event.tags;
    event.organisers = data.organisers
      ? JSON.parse(data.organisers)
      : event.organisers;

    if (data.speakers) {
      event.speakers.forEach((obj) =>
        obj.avatar ? unUpload(obj.avatar) : null
      );
      JSON.parse(data.speakers).forEach((speaker) => {
        let obj = {
          name: speaker.name,
          about: speaker.about,
        };

        if (speaker.avatar) {
          obj.avatar = upload(files[speaker.avatar], "avatar");
        }

        event.speakers = [...event.speakers, obj];
      });
    }
    if (data.moderators) {
      event.moderators.forEach((obj) =>
        obj.avatar ? unUpload(obj.avatar) : null
      );
      JSON.parse(data.moderators).forEach((moderator) => {
        let obj = {
          name: moderator.name,
          about: moderator.about,
        };

        if (moderator.avatar) {
          obj.avatar = upload(files[moderator.avatar], "avatar");
        }

        event.moderators = [...event.moderators, obj];
      });
    }
    if (data.resources) {
      event.resources.forEach((obj) =>
        unstructured.includes(obj.resourceType) ? unUpload(obj.content) : null
      );
      JSON.parse(data.resources).forEach((resource) => {
        let obj = {
          resourceType: resource.resourceType,
        };

        if (unstructured.includes(resource.resourceType)) {
          obj.content = upload(files[resource.content], "resource");
        } else {
          obj.content = resource.content;
        }

        event.resources = [...event.resources, obj];
      });
    }

    await event.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.json({error: err.message});
  }
});

router.delete("/:id", async (req, res, next) => {
  // delete specific event by id
  try {
    const eventId = req.params.id,
      event = await Events.findById(eventId);

    if (!(await event)) throw new Error("event not found!");

    event.speakers.forEach((obj) => (obj.avatar ? unUpload(obj.avatar) : null));
    event.moderators.forEach((obj) =>
      obj.avatar ? unUpload(obj.avatar) : null
    );
    event.resources.forEach((obj) =>
      unstructured.includes(obj.resourceType) ? unUpload(obj.content) : null
    );

    await event.remove();
    return res.sendStatus(200);
  } catch (err) {
    return res.json({error: err.message});
  }
});

module.exports = router;
