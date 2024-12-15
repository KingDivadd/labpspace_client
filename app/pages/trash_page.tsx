'use client'
import React, {useState, useEffect} from 'react'
import Modal from '../component/modals/modal'
import { useChat } from '../context/ChatContext'
import { useRouter } from 'next/navigation'
import { get_auth_request } from '../api'
import Alert, {AssetCont, AvatarUserInfo, Dropdown, SmallAvatar, formatted_time, readable_date} from '../component/helper'
import moment from 'moment'
import Loading from '../component/loading'
import { FaCaretUp, FaCaretDown } from 'react-icons/fa6'

const Trash_page = () => {
    const router = useRouter()
    const [page_number, setPage_number] = useState(1)
    const [list_number, setList_number] = useState(15)
    const [trash_box, setTrash_box] = useState<Props | null>(null);
    const [filtered_trash_box, setFiltered_trash_box] = useState<Props | null>(null);
    const [filters, setFilters] = useState({filter_input: '', disposition: ''})
    const {loggedInUser, modalFor, setModalFor, selectedItem, setSelectedItem, showModal, setShowModal, setModalSource, modalSource, setApp_users} = useChat()
    const [alert, setAlert] = useState({message: '', type: ''})
    const [loading, setLoading] = useState(true)
    const [isActive, setIsActive] = useState(true);
    const toggleActive = () => setIsActive(!isActive);
    const [drop_list_no, setDrop_list_no] = useState(false)
    const [filter_trash, setFilter_trash] = useState('all')



    interface Props {
        forEach?(arg0: (data: any, ind: number) => void): unknown;
        filter?(arg0: (trash: any) => any): unknown;
        map?(arg0: (data: any) => void): unknown;
        total_number_of_pages?: number; // Now optional and can be undefined
        total_number_of_trash?: number; // Now optional can be undefined
        trash: any[];
    } 

    useEffect(() => {
        const x_id_key = localStorage.getItem('x-id-key')
        if (x_id_key) {
            handle_fetch_trash(list_number, page_number)
        }else{
            router.push('/auth/login')
        }
    }, [showModal, list_number])

    function showAlert(message: string, type: string){
        setAlert({message: message, type: type})
            setTimeout(() => {
                setAlert({message: '', type: ''})
            }, 3000);
    }
    

    async function handle_fetch_trash(list_num: number, page_num: number) {

            try {
                const response = await get_auth_request(`app/all-paginated-trash/${list_num}/${page_num}`)  

                if (response.status == 200 || response.status == 201){

                    const trash = response.data
                    setLoading(false);
                    setTrash_box(trash)
                    setFiltered_trash_box(trash)

                    console.log('all trash \n',trash)
                                        
                }else if(response.response.status == 401){
                    router.push('/auth/login')
                }
                else{
                    showAlert(response.response.data.err, "error")
                }
            } catch (err:any) {
                console.error('Network or unexpected error:', err);
                showAlert('An unexpected error occurred. Please try again later.', 'error');
            } 
        
    }


    async function app_trash_action(item: any) {
        let new_page_number = page_number;
        let max_page_number = trash_box?.total_number_of_pages

        if (item === 'prev') {
        if (page_number > 1) {
            new_page_number = page_number - 1;
        }
        } else if (item === 'next') {
        if (max_page_number && page_number < max_page_number) {
            new_page_number = page_number + 1;
        }
        } else {
        new_page_number = item;
        }

        handle_fetch_trash(list_number, new_page_number)
        setPage_number(new_page_number);
        
    }

    const render_page_numbers = () => {
        const pages = [];
        const max_page_number = trash_box?.total_number_of_pages || 1;
        const max_displayed_pages = 3;

        if (max_page_number <= max_displayed_pages) {
        for (let i = 1; i <= max_page_number; i++) {
            pages.push(
            <p
                key={i}
                className={`text-md font-light h-[27px] w-[30px] rounded-[3px] flex items-center justify-center cursor-pointer ${
                page_number === i ? 'bg-blue-600 text-white' : ''
                }`}
                onClick={() => app_trash_action(i)}
            >
                {i}
            </p>
            );
        }
        } else {
        let startPage = Math.max(1, page_number - 1);
        let endPage = Math.min(page_number + 1, max_page_number);

        if (page_number === 1) {
            startPage = 1;
            endPage = max_displayed_pages;
        } else if (page_number === max_page_number) {
            startPage = max_page_number - 2;
            endPage = max_page_number;
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
            <p
                key={i}
                className={`text-sm font-light h-[27px] w-[30px] rounded-[3px] flex items-center justify-center cursor-pointer ${
                page_number === i ? 'bg-blue-700 text-white' : ''
                }`}
                onClick={() => app_trash_action(i)}
            >
                {i}
            </p>
            );
        }
        }

        return pages;
    };  

    async function handle_filter(e: any) {
        const value = e.target.value.toLowerCase();
        setFilters({ ...filters, filter_input: value });
    
        if (trash_box && trash_box.trash) {
            if (value.trim() !== '') {
                const filtered_trash:any = trash_box.trash.filter((data: any) => {

                    const trash_ind = data.trash_ind?.toLowerCase() || '';
                    const trash_title = data.trash_title?.toLowerCase() || ''
                    const priority = data.priority?.toLowerCase() || ''
                    const stage = data.stage?.toLowerCase() || ''
                    
                    return (
                        trash_ind.includes(value) ||
                        trash_title.includes(value) ||
                        priority.includes(value) ||
                        stage.includes(value) 

                    );
                });
                
                console.log(filtered_trash)

                // setFiltered_trash_box({...filtered_trash_box, trash: filtered_trash})
    
            } else {
                setFiltered_trash_box(trash_box); // Reset to the original list
            }
        }
    }




    function handle_restore(data:any) {
        setShowModal(!showModal)
        setModalFor('restore')
        setModalSource('trash-modal')
        setSelectedItem(data)
    }

    function handle_delete(data:any) {
        setShowModal(!showModal)
        setModalFor('delete')
        setModalSource('trash-modal')
        setSelectedItem(data)
    }

    function handle_restore_all(){
        setShowModal(!showModal)
        setModalFor('restore-all')
        setModalSource('trash-modal')
        setSelectedItem(null)
    }

    function handle_list_no(data:any) {
        if (data == 'all') {
            setList_number(100000000000000)
        }else{
            setList_number(data)
        }
        setDrop_list_no(!drop_list_no)
    }

    function handle_selected(selected: string, id?:string){
        console.log(id, selected)
        if (selected === 'All trash'){
            if (filtered_trash_box?.trash && trash_box?.trash) {
                
                setFiltered_trash_box({...filtered_trash_box, trash:trash_box?.trash})
            }


        }else if(selected === 'Assigned trash' ){
            if (filtered_trash_box?.trash) {
                console.log('Logging filtered_trash_box: ', filtered_trash_box);
        
                const trash = filtered_trash_box?.trash;
        
                // Filter trash assigned to the logged-in user
                const new_trash = trash.filter((trash: any) => {
                    return trash.team.some((member: any) => {
                        console.log('Logged-in user:', loggedInUser.user_id, '\n', 'User ID:', member.user.user_id);
                        return member.user.user_id === loggedInUser.user_id;
                    });
                });
            
                setFiltered_trash_box({...filtered_trash_box, trash:new_trash})
            }

        }else if (selected === 'trash Created'){

            if(filtered_trash_box?.trash){
        
                    const trash = filtered_trash_box?.trash
        
                    const new_trash =  trash.filter((trash:any)=>{
                        return trash.trash_creator_id == loggedInUser.user_id
                    })
        
                    setFiltered_trash_box({...filtered_trash_box, trash:new_trash})            
            }

        }
    }


    return (
        <div className='w-full flex items-start justify-center  px-[20px] md:px-[55px] lg:px-[75px] py-5 relative '  >
            <span className="px-[20px] flex items-center justify-end absolute top-[15px] right-[50px] z-20 h-[50px]  ">

                {alert.message && <Alert message={alert.message} type={alert.type} />} 
            </span>

            <div className="w-full flex flex-col justify-start items-center gap-5">

                {/* section showing metrics */}

                {/* <div className="w-full flex items-center justify-end">


                    <button className="max-sm:hidden px-5 whitespace-nowrap h-[45px] rounded-[3px] text-white bg-blue-600 hover:bg-blue-700" onClick={handle_restore_all} >Restore All</button>
                </div> */}


                {/* section four recent transaction table */}
                <div className="w-full flex flex-col items-start justify-start shadow-lg rounded-[3px] border border-slate-100">
                    <span className="h-[50px] w-full flex items-center justify-start px-[15px] border-b border-slate-200 ">
                        <p className="text-md font-[600] ">Trash</p>
                    </span>
                    
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[1350px] p-[15px] flex flex-col items-start justify-start mx-auto ">
                            <span className="w-full h-[50px] flex items-center justify-between bg-blue-600 text-white rounded-[3px]">
                                <p className="text-sm w-[17.5%] px-[15px] ">Delete on</p>
                                <p className="text-sm w-[15%] px-[15px] ">Deleted By</p>
                                <p className="text-sm w-[50%] px-[15px] ">File Deleted</p>
                                <p className="text-sm w-[17.5%] px-[15px] ">Action</p>
                            </span>

                            {loading ? 
                            
                            <div className="w-full h-[500px] flex items-center justify-center  ">
                                <Loading />
                            </div>
                            :
                            <div className="w-full h-[500px] flex flex-col items-start justify-start overflow-y-auto">
                                <div className="w-full h-full flex flex-col justify-start">
                                    
                                    {filtered_trash_box?.trash.length ? 
                                    <>
                                    {filtered_trash_box?.trash.map((data: any, ind: number)=>{
                                        const {trash_id, updated_at, deleted_by, deleted_task, deleted_user} = data                                        

                                        const deleted_file = deleted_task ? `Task with and Id of  ${deleted_task.task_ind} and title ${deleted_task.task_title} assigned to ${deleted_task.team.length} members` : deleted_user ? `Lab User with the name of ${deleted_user.first_name} ${deleted_user.last_name} and title of ${deleted_user.title}`: ''

                                        return(
                                            <span key={ind} className=" table-body-row-1  " >
                                                <p className="text-sm font-[500] w-[17.5%] px-[15px] text-slate-600 ">{readable_date(Number(updated_at)/1000)}</p>
                                                <p className="text-sm font-[500] w-[15%] px-[15px] text-slate-600 overflow-x-auto">{deleted_by ? `${deleted_by.first_name} ${deleted_by.last_name}` : '--'}</p>
                                                <p className="text-sm font-[500] w-[50%] px-[15px] cursor-pointer text-slate-600 hover:underline ">{deleted_file}</p>
                                                <span className="w-[17.5%] px-[15px] flex items-center gap-5">
                                                    <button className="h-[30px] rounded-[2.5px] bg-blue-600 hover:bg-blue-700 text-white px-5 text-sm" onClick={()=> handle_restore(data)}> Restore</button>

                                                    <button className="h-[30px] rounded-[2.5px] bg-red-600 hover:bg-red-700 text-white px-5 text-sm" onClick={()=> handle_delete(data)}> Delete</button>
                                                </span>
                                                
                                                
                                            </span>
                                        )
                                    })}
                                    </>
                                    : 
                                    <div className="w-full flex items-center justify-center h-full  ">
                                        <p className="text-md font-[500] ">Trash is empty</p>
                                    </div> }
                                </div>
                            </div>}

                        </div>
                    </div>

                    <span className="w-full h-[50px] flex flex-row items-center justify-between bg-white rounded-b-[3px] border-t border-gray-300 px-[15px] ">
                        <span className="flex flex-row items-center justify-start gap-3 h-full">
                            <p className="text-md cursor-pointer" onClick={() => app_trash_action('prev')}>Prev</p>
                            <span className="w-auto h-full flex flex-row items-center justify-start">
                            {render_page_numbers()}
                            </span>
                            <p className="text-md cursor-pointer" onClick={() => app_trash_action('next')}>Next</p>
                        </span>
                        <span className="flex flex-row items-center justify-end gap-3 h-full">
                            <p className="text-md"> 
                                {
                                    list_number != 100000000000000 ? 
                                    <> Showing 1-{ list_number} of {(filtered_trash_box && filtered_trash_box.trash.length)  || 0} </>:
                                    <> Showing All of {(filtered_trash_box && filtered_trash_box.trash.length) || 0}</>
                                }
                            </p>
                        </span>
                    </span>
                </div>


            </div>

            {showModal && <Modal showModal={showModal} setShowModal={setShowModal} modalFor={modalFor} setModalFor={setModalFor} selectedItem={selectedItem} setSelectedItem={setSelectedItem} modalSource={modalSource} setModalSource={setModalSource} />}
        </div>
    )
}

export default Trash_page