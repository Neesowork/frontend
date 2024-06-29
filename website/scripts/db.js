let response_vacancies = null;
let response_resumes = null;

let vacancies_table_body = document.getElementById('vacancies-table-entries');
let resumes_table_body = document.getElementById('resumes-table-entries');

let vacancies_page = 0;
let resumes_page = 0;
let vacancies_tab = document.getElementById('vacancies-tab');

let filters_id = 0;
let apply_filters_btn = document.getElementById('apply-filters');

let vacancies_filters_container = document.getElementById('vacancies-filters');
let vacancies_filter_btn = document.getElementById('add-vacancies-filter');

let resumes_filters_container = document.getElementById('resumes-filters');
let resumes_filter_btn = document.getElementById('add-resumes-filter');

let vacancies_filter_query = null;
let resumes_filter_query = null;

let notificaton_error = document.getElementsByClassName('notification-error')[0];
let notifications_hub = document.getElementById('notifications-hub');

const hostname = '127.0.0.1'

function reset_tables()
{
    vacancies_page = 0;
    resumes_page = 0;
    
    append_vacancies_table();
    append_resumes_table();
}

function enable_tooltips(element)
{
    const tooltipTriggerList = element.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

async function init()
{
    reset_tables();

    let vacancies_filter_instance = document.getElementsByClassName('vacancies-filter')[0].cloneNode(true);
    document.getElementsByClassName('vacancies-filter')[0].remove();

    vacancies_filter_btn.onclick = () => {
        let new_filter = vacancies_filter_instance.cloneNode(true);
        enable_tooltips(new_filter);
        new_filter.getElementsByClassName('btn-remove-filter')[0].onclick = () =>
        {
            new_filter.remove();
        }
        let order_switch = new_filter.getElementsByClassName('ordering-select')[0];
        new_filter.getElementsByClassName('form-check-input')[0].onclick = () =>
        {
            order_switch.disabled = !order_switch.disabled;
        }
        vacancies_filters_container.appendChild(new_filter);
    }

    let resumes_filter_instance = document.getElementsByClassName('resumes-filter')[0].cloneNode(true);
    document.getElementsByClassName('resumes-filter')[0].remove();
    

    resumes_filter_btn.onclick = () => {
        let new_filter = resumes_filter_instance.cloneNode(true);
        enable_tooltips(new_filter);
        new_filter.getElementsByClassName('btn-remove-filter')[0].onclick = () =>
        {
            new_filter.remove();
        }
        let order_switch = new_filter.getElementsByClassName('ordering-select')[0];
        new_filter.getElementsByClassName('form-check-input')[0].onclick = () =>
        {
            order_switch.disabled = !order_switch.disabled;
        }
        resumes_filters_container.appendChild(new_filter);
    }

    apply_filters_btn.onclick = () => {
        let vacancies_filters = document.getElementsByClassName('vacancies-filter');
        let vacancies_filter_obj = {};
        for (let i = 0; i < vacancies_filters.length; i++)
        {
            let entry = {};
            let key = vacancies_filters[i].getElementsByClassName('key-select')[0].selectedOptions[0].value;
            if (!(key in vacancies_filter_obj))
            {
                vacancies_filter_obj[key] = [];
            }
            let text = vacancies_filters[i].getElementsByClassName('filter-search')[0].value;
            entry['text'] = text
            if (vacancies_filters[i].getElementsByClassName('form-check-input')[0].checked)
            {
                entry['ordering'] = vacancies_filters[i].getElementsByClassName('ordering-select')[0].selectedOptions[0].value;
            }
            vacancies_filter_obj[key].push(entry);
        }

        let resumes_filters = document.getElementsByClassName('resumes-filter');
        let resumes_filter_obj = {};
        for (let i = 0; i < resumes_filters.length; i++)
        {
            let entry = {};
            let key = resumes_filters[i].getElementsByClassName('key-select')[0].selectedOptions[0].value;
            if (!(key in resumes_filter_obj))
            {
                resumes_filter_obj[key] = [];
            }
            let text = resumes_filters[i].getElementsByClassName('filter-search')[0].value;
            entry['text'] = text
            if (resumes_filters[i].getElementsByClassName('form-check-input')[0].checked)
            {
                entry['ordering'] = resumes_filters[i].getElementsByClassName('ordering-select')[0].selectedOptions[0].value;
            }
            resumes_filter_obj[key].push(entry);
        }

        vacancies_filter_query = '&filter=' + JSON.stringify(vacancies_filter_obj);
        resumes_filter_query = '&filter=' + JSON.stringify(resumes_filter_obj);

        vacancies_table_body.replaceChildren();
        resumes_table_body.replaceChildren();

        reset_tables();
    }
}

function init_ordering_switches()
{
    let ordering_switches = [];
    let ordering_selects = [];
    let remove_buttons = [];

    for (let i = 0; i < filters.length; i++)
    {   
        ordering_switches.push(filters[i].getElementsByClassName('form-check-input')[0]);
        ordering_selects.push(filters[i].getElementsByClassName('ordering-select')[0]);
        remove_buttons.push(filters[i].getElementsByClassName('btn-remove-filter')[0]);

        ordering_switches[i].onclick = () => {
            ordering_selects[i].disabled = !ordering_selects[i].disabled;
        }

        remove_buttons[i].onclick = () => {
            filters[i].remove();
        }
    }
}

async function append_resumes_table()
{
    try {
        response_resumes = await fetch('http://' + hostname + ':8000/db/resumes?page=' + resumes_page + (resumes_filter_query ? resumes_filter_query : ''));
    }
    catch (e)
    {
        notify('Error loading resumes', e);
        return
    }

    response_resumes = await response_resumes.json();

    display_resumes_rows(response_resumes);
    resumes_page += 1;
}

async function append_vacancies_table()
{
    try {
        response_vacancies = await fetch('http://' + hostname + ':8000/db/vacancies?page=' + vacancies_page + (vacancies_filter_query ? vacancies_filter_query : ''));
    }
    catch (e)
    {
        notify('Error loading vacancies', e);
        return
    }

    response_vacancies = await response_vacancies.json()

    display_vacancies_rows(response_vacancies);
    vacancies_page += 1;
}

init();
window.onscrollend = () => {
    if (Math.abs(document.documentElement.scrollHeight - document.documentElement.scrollTop - document.documentElement.clientHeight) < 10)
    {
        if (vacancies_tab.ariaSelected == 'true')
        {
            append_vacancies_table();
        }
        else
        {
            append_resumes_table();
        }
    }
}

function transform_list_text(text, type = 0)
{
    list = JSON.parse(text);
    if (type != 1)
    {
        list = JSON.parse(list);
    }
    let result = ''
    for (let i = 0; i < list.length; i++)
    {
        if (type == 2)
        {
            result += list[i][0] + '\n→\n' + list[i][1] + '\n\n';
        }
        else
        {
            result += list[i] + '\n\n';
        }
    }
    return result
}

function display_resumes_rows(json)
{
    table_rows = [];

    for (let i = 0; i < json.length; i++)
    {
        table_rows.push(document.createElement('tr'));

        index = document.createElement('th');
        index.scope = 'row';
        index.innerText = resumes_page*20 + i+1;

        table_rows[i].appendChild(index);

        if(json[i]['salary'] == 0)
        {
            json[i]['salary'] = null;
        }

        if(json[i]['currency'] == 'U')
        {
            json[i]['currency'] = null;
        }


        if(json[i]['gender'] == 'U')
        {
            json[i]['gender'] = null;
        }

        json[i]['id'] = json[i]['id'].slice(0,19) + '\n' + json[i]['id'].slice(19,38);

        let data = [json[i]['id'], json[i]['position'], json[i]['age'], json[i]['birthday'], json[i]['search_status'], json[i]['address'], json[i]['gender'], transform_list_text(json[i]['specializations']), json[i]['about'], json[i]['salary'], json[i]['currency'], json[i]['preferred_commute_time'], transform_list_text(json[i]['skills']), transform_list_text(json[i]['employment'], 1), json[i]['moving_status'], json[i]['citizenship'], transform_list_text(json[i]['languages']), transform_list_text(json[i]['education'], 2), transform_list_text(json[i]['schedule'], 1)];

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

function display_vacancies_rows(json)
{
    table_rows = [];

    for (let i = 0; i < json.length; i++)
    {
        table_rows.push(document.createElement('tr'));

        index = document.createElement('th');
        index.scope = 'row';
        index.innerText = vacancies_page*20 + i+1;

        table_rows[i].appendChild(index);

        let data = [json[i]['id'], json[i]['name'], json[i]['area'], json[i]['average_salary'], json[i]['currency'], json[i]['type'], json[i]['employer'], json[i]['requirement'], json[i]['responsibility'], json[i]['schedule'], json[i]['experience'], json[i]['employment']];

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

function notify(title, description)
{
    notification = notificaton_error.cloneNode(true);
    notification.getElementsByTagName('strong')[0].innerText = title;
    notification.getElementsByClassName('toast-body')[0].innerText = description;

    notification.classList.add('show')
    notifications_hub.appendChild(notification);
    return notification
}