import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const INSTANCE_EXPORT_REQUEST = 'INSTANCE_EXPORT_REQUEST'
export const INSTANCE_EXPORT_SUCCESS = 'INSTANCE_EXPORT_SUCCESS'
export const INSTANCE_EXPORT_FAILURE = 'INSTANCE_EXPORT_FAILURE'

// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchInstanceExport(body, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${body.clusterID}/containers/${body.containers}/export`
  return {
    [FETCH_API]: {
      types: [INSTANCE_EXPORT_REQUEST, INSTANCE_EXPORT_SUCCESS, INSTANCE_EXPORT_FAILURE],
      endpoint,
      schema: {},
      options: {
          method: 'POST',
          body: body.body
      },
    },
    callback
  }
}

// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function instanceExport(body, callback) {
  return (dispatch) => {
    return dispatch(fetchInstanceExport(body, callback))
  }
}