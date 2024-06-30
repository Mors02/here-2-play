import { Typography, Box, Button, Stack, Container, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import React, { useState } from 'react';
import Modal from 'react-modal';
import { MdReport } from "react-icons/md";
import { toast } from 'react-toastify';
import { axiosConfig } from '../config/axiosConfig';
import { ErrorMap } from '../config/enums';
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

export default function ReportGameModal({afterOpenModal, closeModal, modalIsOpen, gameReported}) {
    const [selected, setSelected] = useState("ex")

    function report() {
        console.log(selected);
        axiosConfig.post('api/reports/game/', {gameReported, selected})
        .then(res => {
            console.log(res)
            toast.success("Segnalazione completata.", {onClose: () => {closeModal(); setSelected("ex")}})
        })
        .catch(err => {
            console.log(err)
            toast.error(ErrorMap[err["response"]["data"]]);
        })
    }

    const causes ={
        "ex": "Contenuti sessuali",
        "ha": "Incitamento all'odio",
        "ra": "Razzismo",
        "sc": "Truffa",
        "ot": "Altro"
    }
  return (
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
            <Typography variant='h4' className='text-center'>Segnalazione {gameReported.name}</Typography>
            <Box>
                <Stack>
                    <FormControl>
                        <FormLabel>Causa</FormLabel>
                            <RadioGroup>
                                {Object.keys(causes).map((key) => (
                                    <Container>
                                        <FormControlLabel checked={key == selected} value={key} control={<Radio />} onChange={() => setSelected(key)}  label={causes[key]} />
                                    </Container>
                                ))}
                            </RadioGroup>                   
                    </FormControl>
                    <Box>
                        <Button variant="text" onClick={() => closeModal()} color="error">Chiudi</Button>
                        <Button variant="contained" className='float-right' color="error" onClick={() => report()}><MdReport />Segnala</Button>
                    </Box>
                </Stack>
            </Box>
      </Modal>
  );
}
