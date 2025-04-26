// const authToken = sessionStorage.getItem('authToken');
const containerSesi = document.querySelector('.content-sesi');

fetch('https://mentalwell-backend.vercel.app/history', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch data. Status: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    if (data && Array.isArray(data)) {
      if (data.length === 0) {
        const noDataElement = document.createElement('p');
        noDataElement.textContent = 'Tidak ada sesi konseling.';
        containerSesi.appendChild(noDataElement);
      } else {
        data.forEach(sesi => {
          const sesiElement = document.createElement('div');
          sesiElement.classList.add('container-sesi');

          const isReviewFilled = sesi.review !== null;
          const scheduleDateString = sesi.schedule_date;
          const scheduleDate = new Date(scheduleDateString);
          const optionsSchedule = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

          const formattedScheduleDate = scheduleDate.toLocaleDateString('id-ID', optionsSchedule)

          let formattedType;

          if (sesi.type == "chat") {
            formattedType = "Chat"
          } else if (sesi.type == "call") {
            formattedType = "Call"
          } else if (sesi.type == "video_call") {
            formattedType = "Video Call"
          }

          let formattedStatus;

          if (sesi.status == "belum_selesai") {
            formattedStatus = "Belum Selesai"
          } else if (sesi.status == "selesai") {
            formattedStatus = "Selesai"
          }

          let formattedScheduleTime;

          if (sesi.schedule_time == "13:00-14:00") {
            formattedScheduleTime = "13.00 - 14.00"
          } else if (sesi.schedule_time == "16:00-17:00") {
            formattedScheduleTime = "16.00 - 17.00"
          } else if (sesi.schedule_time == "19:30-20:30") {
            formattedScheduleTime = "19.30 - 20.30"
          }

          sesiElement.innerHTML = `
            <img src="${sesi.profile_image}" alt="Foto Psikolog" id="psychologPhoto" />
            <div class="info-sesi">
              <div class="info-text">
                <p>
                  ${sesi.psychologist_name}<br />
                  ${formattedScheduleDate}<br />
                  ${formattedScheduleTime} WIB<br />
                  Via ${formattedType}
                </p>
                </div>
                <div class="status-button">
                  <span class="status-sesi">${formattedStatus}</span>
                  <button type="button" data-counseling-id="${sesi.id}" onclick="openChatPopup(${sesi.id}, '${riwayat.status}')"
                    ${sesi.status === 'belum_selesai' || isReviewFilled ? 'disabled' : ''}
                    style="${(sesi.status === 'belum_selesai' || isReviewFilled) ? 'background-color: lightgray; color: gray; cursor: default' : ''}">
                    ${isReviewFilled ? 'CHAT SELESAI' : 'MULAI CHAT'}
                  </button>
                </div>
              </div>
          `;

          containerSesi.appendChild(sesiElement);
        });
      }
    } else {
      console.error('Invalid data format received from the server.');
    }
  })
  .catch(error => console.error('Error fetching data from API:', error));
