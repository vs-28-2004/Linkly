import mongoose from "mongoose";

/** Rejects requests whose :params are not valid Mongo ObjectIds (avoids CastError 500s). */
export const validateObjectId = (...names) => (req, res, next) => {
    for (const name of names) {
        if (!mongoose.isObjectIdOrHexString(req.params[name])) {
            return res.status(400).json({ success: false, message: `Invalid ${name}` });
        }
    }
    next();
};
