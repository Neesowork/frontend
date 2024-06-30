const vacancies_table_body = document.getElementById('vacancies-table-entries');
const resumes_table_body = document.getElementById('resumes-table-entries');

const search_textbox = document.getElementById('search-text');
const salary_textbox = document.getElementById('search-salary');
const page_textbox = document.getElementById('search-page');

const experience_select = document.getElementById('experience-select');
const employment_select = document.getElementById('employment-select');
const schedule_select = document.getElementById('schedule-select');

const notifications_hub = document.getElementById('notifications-hub');
const notifications = [
    document.getElementsByClassName('notification-loading')[0],
    document.getElementsByClassName('notification-error')[0],
    document.getElementsByClassName('notification-success')[0],
];

const search_vacancies_option = document.getElementById('search-vacancies-option')
const submit_btn = document.getElementById('send-query-btn');

const hostname = '127.0.0.1';

function get_checked_params(within_element)
{
    let params = [];
    let checkboxes = within_element.getElementsByTagName('input');

    for (let i = 0; i < checkboxes.length; i++)
    {
        if (checkboxes[i].checked)
        {
            params.push(checkboxes[i].value);
        }
    }

    return params
}

async function submit()
{
    let searching_vacancies = search_vacancies_option.checked;

    let employment_params = get_checked_params(employment_select);
    let schedule_params = get_checked_params(schedule_select);

    params = {}

    if (search_textbox.value)
    {
        params['text'] = search_textbox.value;
    }

    if (salary_textbox.value)
    {
        if (salary_textbox.value !== parseInt(salary_textbox.value, 10).toString())
        {
            notify('error', 'Error', 'Salary must be a valid number');
            return;
        }

        params['salary'] = salary_textbox.value;
    }

    if (page_textbox.value)
    {
        if (page_textbox.value !== parseInt(page_textbox.value, 10).toString())
        {
            notify('error', 'Error', 'Page must be a valid number');
            return;
        }
        else if (searching_vacancies && (parseInt(page_textbox.value, 10) > 20))
        {
            notify('error', 'Error', 'Page number cant be greater than 20 for vacancies');
            return;
        }

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
        return;
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
        notify('error', 'Error', 'Could not fetch data the from server');
    }
}

function preview_resumes(json)
{
    resumes_table_body.replaceChildren(); // Clears the table
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
    vacancies_table_body.replaceChildren(); // Clears the table
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

submit_btn.onclick = submit;