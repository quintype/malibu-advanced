import { Collection } from '@quintype/framework/server/api-client'

export function loadCollectionPageData (client, params = {}, config, qtInternalAppsKey = '') {
  const collectionSlug = params?.collectionSlug || ''
  const opts = qtInternalAppsKey && params?.previewId ? { qtInternalAppsKey, previewId: params.previewId } : {}
  return Collection.getCollectionBySlug(client, collectionSlug, { limit: 9 }, { depth: 2, ...opts }).then(
    collection => {
      return {
        collection: (collection && collection.asJson()) || {},
        cacheKeys: collection && collection.cacheKeys(config['publisher-id'])
      }
    }
  )
}
