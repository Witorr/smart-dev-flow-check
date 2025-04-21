// Utilitário para integração com a API do Calendly
// Docs: https://developer.calendly.com/api-docs

export async function createCalendlyEvent({userUri, inviteeEmail, startTime, endTime, eventName, description, accessToken}: {
  userUri: string, // ex: 'https://api.calendly.com/users/USER_ID'
  inviteeEmail: string,
  startTime: string, // ISO 8601
  endTime: string, // ISO 8601
  eventName: string,
  description?: string,
  accessToken: string // Personal Access Token do Calendly
}) {
  const url = 'https://api.calendly.com/scheduled_events';
  const body = {
    organization: userUri,
    event_type: eventName,
    start_time: startTime,
    end_time: endTime,
    invitees: [
      { email: inviteeEmail }
    ],
    description
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao criar evento no Calendly');
  }
  return await res.json();
}
