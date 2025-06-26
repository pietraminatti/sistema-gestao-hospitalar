import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import SelectService from "./SelectService";
import DoctorList from "./DoctorList";
import SelectDateTime from "./SelectDateTime";
import ConfirmAppointment from "./ConfirmAppointment";
import PaymentCheckout from "./PaymentCheckout";

interface BookAppointmentProps {
  onClose: () => void;
  patientId?: string; // ID do paciente atual
}

const BookAppointment: React.FC<BookAppointmentProps> = ({
  onClose,
  patientId,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [workSchedule, setWorkSchedule] = useState<any>(null);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);

  const steps = [
    "Escolher serviço",
    "Escolher médico",
    "Escolher data e hora",
    "Pagamento",
    "Confirmação",
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    handleNext();
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    handleNext();
  };

  const handleDateTimeSelect = (
    date: Date,
    time: string,
    workSchedule: object
  ) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setWorkSchedule(workSchedule);
    handleNext();
  };

  const handlePaymentComplete = async (paymentContent: string) => {
    try {
      setLoading(true);
      setError(null);
      setPaymentCompleted(true);

      await createAppointment(patientId, note, workSchedule.id, paymentContent);

      setActiveStep(4);
    } catch (err) {
      console.error("Falha ao processar o pagamento:", err);
      setError("Pagamento falhou. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !patientId) {
      setError("Informações da consulta incompletas. Por favor, verifique.");
      return;
    }

    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedService(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime("");
    setWorkSchedule(null);
    setNote("");
    onClose();
    // redirecionar para a lista de consultas ou mostrar mensagem de sucesso
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Agendar consulta
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && <SelectService onSelect={handleServiceSelect} />}

      {activeStep === 1 && (
        <DoctorList
          specialty={selectedService}
          onSelect={handleDoctorSelect}
          // onBack={handleBack}
        />
      )}

      {activeStep === 2 && (
        <SelectDateTime
          doctor={selectedDoctor}
          onSelect={handleDateTimeSelect}
          patientId={patientId}
          // onBack={handleBack}
        />
      )}

      {/* {activeStep === 3 && (
				<Box>
					<DoctorDetails doctor={selectedDoctor} />
					<Box sx={{ mt: 3 }}>
						<Typography variant="h6" gutterBottom>
							Detalhes da consulta
						</Typography>
						<Typography variant="body1">
							Data: {selectedDate ? selectedDate.toLocaleDateString() : ""}
						</Typography>
						<Typography variant="body1">
							Horário:{" "}
							{selectedTime
								? `${selectedTime.start} - ${selectedTime.end}`
								: ""}
						</Typography>
						<Typography variant="body1">
							Serviço: {selectedService.name}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
						<Button
							variant="contained"
							color="primary"
							onClick={handlePaymentComplete}
							disabled={loading}
						>
							{loading ? "Processando..." : "Realizar pagamento"}
						</Button>
					</Box>
				</Box>
			)} */}

      {activeStep === 3 && (
        <PaymentCheckout
          onPaymentComplete={handlePaymentComplete}
          // onBack={handleBack}
          // onReset={handleReset}
          workSchedule={workSchedule}
          service={selectedService}
          loading={loading}
        />
      )}

      {activeStep === 4 && (
        <ConfirmAppointment
          date={selectedDate!}
          time={selectedTime}
          doctor={selectedDoctor}
          specialty={selectedService}
          onDone={handleReset}
        />
      )}

      {activeStep === 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose} sx={{ mr: 1 }} disabled={loading}>
            Cancelar
          </Button>
        </Box>
      )}

      {activeStep !== 0 && activeStep !== 4 && activeStep !== steps.length && (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handleBack} disabled={activeStep === 0 || loading}>
            Voltar
          </Button>
          <Button onClick={onClose} sx={{ mr: 1 }} disabled={loading}>
            Cancelar
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookAppointment;
