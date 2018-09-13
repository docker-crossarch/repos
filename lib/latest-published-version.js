import axios from 'axios'

export async function getLatestPublishedVersionRecord(creds, repoName) {
  const { data } = await axios.get(`${creds.baseUrl}`, {
    headers: { Authorization: `Bearer ${creds.apiKey}` },
  })

  const result = data.records.find(record => record.fields.repository_name === repoName)

  if (!result) {
    return {
      repository_name: repoName,
      version: null,
      id: null,
    }
  }

  return {
    repository_name: result.fields.repository_name,
    version: result.fields.version,
    id: result.id,
  }
}

export async function setLatestPublishedVersion(creds, record, version) {
  const toPost = {
    fields: {
      repository_name: record.repository_name,
      update_date: new Date().toISOString()
      version,
    },
  }

  if (!record.id) {
    // if the record does not exist yet
    await axios.post(`${creds.baseUrl}`, toPost, {
      headers: { Authorization: `Bearer ${creds.apiKey}` },
    })
  } else {
    await axios.patch(`${creds.baseUrl}/${record.id}`, toPost, {
      headers: { Authorization: `Bearer ${creds.apiKey}` },
    })
  }
}
