/* eslint-disable no-unused-vars */
import { Collection } from '@quintype/framework/server/api-client'
import { getStoryLimits, getNestedCollectionLimit } from '../../isomorphic/components/get-collection-template'

export async function loadHomePageData (client, config, params = {}, qtInternalAppsKey = '') {
  const slug = params?.collectionSlug || 'home'
  const isPreviewPage = qtInternalAppsKey && params?.previewId
  const opts = isPreviewPage ? { qtInternalAppsKey, previewId: params.previewId } : {}
  const collection = await Collection.getCollectionBySlug(
    client,
    slug,
    { 'item-type': 'collection' },
    {
      depth: 2,
      storyLimits: getStoryLimits(),
      nestedCollectionLimit: getNestedCollectionLimit(),
      defaultNestedLimit: 4,
      ...opts
    }
  )
  return {
    collection: collection.asJson(),
    cacheKeys: isPreviewPage ? 'DO_NOT_CACHE' : collection?.cacheKeys(config['publisher-id'])
  }
}
