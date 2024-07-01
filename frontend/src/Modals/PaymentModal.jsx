import { Typography, Box, Button, Stack, Container, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Divider } from '@mui/material';
import React, { useState } from 'react';
import Modal from 'react-modal';
import { MdClose, MdReport } from "react-icons/md";
import { toast } from 'react-toastify';
import { axiosConfig } from '../config/axiosConfig';
import { ErrorMap } from '../config/enums';
import useCurrentUser from '../config/UseCurrentUser';
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

export default function PaymentModal({afterOpenModal, closeModal, modalIsOpen, order}) {
    const {user} = useCurrentUser()

    function pay(method) {
        console.log(method, order.id);
        axiosConfig.post('api/orders/' + order.id + "/", {method})
        .then(res => {
            console.log(res)
            if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                throw new Error(res["response"]["data"])
            toast.success("Acquisto completato.", {onClose: () => {closeModal(); window.location.replace("user/"+user.id)}})
        })
        .catch(err => {
            console.log(err)
            toast.error(ErrorMap[err.message]);
        })
    }

    const methods = [
        {"name": "Paypal", "slug": "pay", "color": "info"},
        {"name": "Carta di credito", "slug": "car", "color": "warning"},
        {"name": "Satispay", "slug": "sat", "color": "error"},
    ]
  return (
        <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Modale di pagamento"
        >
            <Box className="w-[500px] relative">
                <MdClose onClick={() => closeModal()} className='absolute top-0 right-0 bg-white !pl-2' size={30} color='red' />
                <Divider>
                    <Typography variant='h6'>Completa il Pagamento</Typography>
                </Divider>

                <Box className="flex gap-4 !mt-4 justify-center">
                    {methods.map((method) => (
                        <Button className='text-nowrap' variant="contained" color={method.color} onClick={() => pay(method.slug)}>{method.name}</Button>
                    ))}
                </Box>
            </Box>
        </Modal>
  );
}

//ReactDOM.render(<App />, appElement);
