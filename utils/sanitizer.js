import {stripHtml} from "string-strip-html";

export default function sanitaze(text) {
  return stripHtml(text).trim();
}
