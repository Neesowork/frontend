submit_btn = document.getElementById('send-query-btn');
search_vacancies_option = document.getElementById('search-vacancies-option')

search_textbox = document.getElementById('search-text');
salary_textbox = document.getElementById('search-salary');
page_textbox = document.getElementById('search-page');

experience_select = document.getElementById('experience-select');
employment_select = document.getElementById('employment-select');
schedule_select = document.getElementById('schedule-select');

notifications_hub = document.getElementById('notifications-hub');
notifications = [
    document.getElementsByClassName('notification-loading')[0],
    document.getElementsByClassName('notification-error')[0],
    document.getElementsByClassName('notification-success')[0],
];

vacancies_table_body = document.getElementById('vacancies-table-entries');
resumes_table_body = document.getElementById('resumes-table-entries');
submit_btn.onclick = submit;

const hostname = '127.0.0.1';

async function submit()
{
    let searching_vacancies = search_vacancies_option.checked;
    let employment_params = [];
    let checkboxes = employment_select.getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++)
    {
        if (checkboxes[i].checked)
        {
            employment_params.push(checkboxes[i].value);
        }
    }

    let schedule_params = [];
    checkboxes = schedule_select.getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++)
    {
        if (checkboxes[i].checked)
        {
            schedule_params.push(checkboxes[i].value);
        }
    }

    params = {}

    if (search_textbox.value)
    {
        params['text'] = search_textbox.value;
    }

    if (salary_textbox.value)
    {
        params['salary'] = salary_textbox.value;
    }

    if (page_textbox.value)
    {
        params['page'] = page_textbox.value - 1;
    }

    if (experience_select.selectedIndex != 0)
    {
        params['experience'] = experience_select.selectedOptions[0].value;
    }

    if (schedule_params.length > 0)
    {
        params['schedule'] = schedule_params;
    }

    if (employment_params.length > 0)
    {
        params['employment'] = employment_params
    }

    let loading_notification = notify('loading', 'Please wait', 'Data is being fetched from the server');
    let response = null;
    
    try {
        response = await fetch('http://' + hostname + ':8000/search/' + (searching_vacancies ? 'vacancies' : 'resumes') + '?' + new URLSearchParams(params).toString());
    }
    catch (e)
    {
        loading_notification.remove();
        notify('error', 'Error fetching ' + (searching_vacancies ? 'vacancies' : 'resumes'), e.message);
        console.log(e);
        return
    }

    loading_notification.remove();

    if (response.ok)
    {
        notify('success', 'Request completed', 'Data has been fetched successfully');
        json = await response.json();
        if (searching_vacancies) 
        {
            preview_vacancies(json);
        }
        else 
        {
            preview_resumes(json);
        }
    }
    else
    {
        notify('error', 'Error', 'Could not fetch data from server');
    }
}

function notify(type, title, description)
{
    let selected_type = -1;

    if (type == 'loading') selected_type = 0;
    if (type == 'error') selected_type = 1;
    if (type == 'success') selected_type = 2;

    notification = notifications[selected_type].cloneNode(true);
    notification.getElementsByTagName('strong')[0].innerText = title;
    notification.getElementsByClassName('toast-body')[0].innerText = description;

    notification.classList.add('show')
    notifications_hub.appendChild(notification);
    return notification
}

function preview_resumes(json)
{
    resumes_table_body.replaceChildren();
    table_rows = [];

    for (let i = 0; i < json.length; i++)
    {
        table_rows.push(document.createElement('tr'));

        index = document.createElement('th');
        index.scope = 'row';
        index.innerText = i+1;

        table_rows[i].appendChild(index);

        let data = [json[i]['position'], json[i]['search_status'], json[i]['address'], json[i]['salary'], json[i]['gender'], json[i]['age'], json[i]['skills']];

        for(let j = 0; j < data.length; j++)
        {
            let td = document.createElement('td');
            td.innerText = data[j];
            table_rows[i].appendChild(td);
        }

        table_rows[i].onclick = () => {
            window.open('https://hh.ru/resume/' + json[i]['id'], '_blank');
        }

        resumes_table_body.appendChild(table_rows[i]);
    }
}

function preview_vacancies(json)
{
    vacancies_table_body.replaceChildren();
    table_rows = [];

    for (let i = 0; i < json.length; i++)
    {
        table_rows.push(document.createElement('tr'));

        index = document.createElement('th');
        index.scope = 'row';
        index.innerText = i+1;

        table_rows[i].appendChild(index);

        let data = [json[i]['name'], json[i]['schedule'], json[i]['average_salary'], json[i]['currency'], json[i]['experience'], json[i]['employment'], json[i]['requirement']];

        for(let j = 0; j < data.length; j++)
        {
            let td = document.createElement('td');
            td.innerText = data[j];
            table_rows[i].appendChild(td);
        }

        table_rows[i].onclick = () => {
            window.open('https://hh.ru/vacancy/' + json[i]['id'], '_blank');
        }

        vacancies_table_body.appendChild(table_rows[i]);
    }
}