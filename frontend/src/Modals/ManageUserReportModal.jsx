import { Box, Button, Divider, Typography } from "@mui/material";
import React, {useState, useEffect} from "react";
import { IoMdClose } from "react-icons/io";
import Modal from 'react-modal';
import { PieChart } from '@mui/x-charts/PieChart';
import { axiosConfig } from "../config/axiosConfig";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

function ManageUserReportModal({ closeModal, modalIsOpen, userReported, updateData }) {
    if (!userReported)
        return

    const translations = {
        'harassment': 'Molestie',
        'spam': 'Spam',
        'bot': 'È un bot',
        'scam': 'È un truffatore',
        'other': 'Altro'
    }

    let data = Object.keys(userReported.reports).map((report, index) => {
        if (report != 'total')
            return {
                id: index,
                value: userReported.reports[report],
                label: translations[report]
            }
    })
    data.shift()

    function deleteReports() {
        confirmAlert({
            title: 'Sei sicuro di voler cancellare tutte le segnalazioni?',
            buttons: [
                {
                    label: 'Procedi',
                    onClick: () => {
                        axiosConfig.delete('/api/reports/user/' + userReported.id + '/')
                            .then(res => {
                                closeModal()
                                updateData()
                                return toast.success('Segnalazioni cancellati')
                            })
                    }
                },
                {
                    label: 'Indietro'
                }
            ]
        }); 
    }

    function deleteUser() {
        confirmAlert({
            title: 'Sei sicuro di voler cancellare l\'utente segnalato?',
            buttons: [
                {
                    label: 'Procedi',
                    onClick: () => {
                        axiosConfig.delete('/api/user/' + userReported.id + '/')
                            .then(res => {
                                closeModal()
                                updateData()
                                return toast.success('Utente cancellato con successo!')
                            })
                    }
                },
                {
                    label: 'Indietro'
                }
            ]
        }); 
    }
    
    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            ariaHideApp={false}
        >
            <Box className="relative p-2">
                <IoMdClose onClick={() => closeModal()} className="cursor-pointer absolute top-0 right-0 bg-white pl-2" size={35} color="red" />
                <Divider className="!mb-6"><b>{userReported.username}</b></Divider>

                <PieChart
                    series={[
                        { data: data },
                    ]}
                    width={700}
                    height={200}
                />
                
                <Box className="grid grid-cols-2 gap-4 !mt-6">
                    <Button onClick={() => deleteReports()} variant="outlined">Cancella Segnalazioni</Button>
                    <Button onClick={() => deleteUser()} color="error" variant="contained">Elimina Utente</Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default ManageUserReportModal;