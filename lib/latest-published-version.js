import axios from 'axios'

export async function getLatestPublishedVersionRecord (creds, repoName) {
  const {data} = await axios.get(`${creds.baseUrl}/published_versions`, { auth: creds })

  const result = data.find(record => record.repository_name === repoName)

  if (!result) {
    return {
      repository_name: repoName,
      version: null,
      id: null
    }
  }

  return result
}

export async function setLatestPublishedVersion (creds, record, version) {
  const toPost = {
    repository_name: record.repository_name,
    update_date: new Date().toISOString().split('T')[0],
    version
  }

  if (!record.id) { // if the record does not exist yet
    await axios.post(`${creds.baseUrl}/published_versions`, toPost, { auth: creds })
  } else {
    await axios.patch(`${creds.baseUrl}/published_versions/${record.id}`, toPost, { auth: creds })
  }
}
