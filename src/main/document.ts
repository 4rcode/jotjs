const local = { document };

/**
 *
 * @returns
 */
export function getDocument(): Document {
  return local.document;
}

/**
 *
 * @param document
 */
export function setDocument(document: Document): void {
  local.document = document;
}
