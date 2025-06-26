import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { formatTimeFromTimeString } from "../../utils/dateUtils";

export default function CancelAppointmentPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [canceledAppointments, setCanceledAppointments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [bankInfo, setBankInfo] = useState<{
    bankName: string;
    accountNumber: string;
  } | null>(null);
  const [loadingBankInfo, setLoadingBankInfo] = useState(false);
  const [bankInfoError, setBankInfoError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  useEffect(() => {
    fetchAppointments(selectedStatus);
  }, [selectedStatus]);

  const transformAppointmentData = (apiData: any) => {
    if (!Array.isArray(apiData)) {
      console.error("Os dados da API não são um array:", apiData);
      return [];
    }

    const transformed = apiData
      .map((appointment, index) => {
        try {
          const dateStr =
            appointment.bookAppointment.workSchedule.dateAppointment;
          const timeStr =
            formatTimeFromTimeString(
              appointment.bookAppointment.workSchedule.shift.start,
              "string"
            ) +
            "-" +
            formatTimeFromTimeString(
              appointment.bookAppointment.workSchedule.shift.end,
              "string"
            );

          return {
            id: appointment.bookAppointment.id,
            patientId: appointment.bookAppointment.patient.userId,
            patientUserId: appointment.bookAppointment.patient.userId,
            patientName: `${appointment.bookAppointment.patient.lastName} ${appointment.bookAppointment.patient.firstName}`,
            appointmentDateTime: `${dateStr} ${timeStr}`,
            appointmentId: appointment.bookAppointment.id,
            status: appointment.bookAppointment.status,
            isRefunded:
              appointment.bookAppointmentPayment.status ===
              PaymentStatus.PAY_BACK,
            paymentStatus: appointment.bookAppointmentPayment.status,
            price: appointment.bookAppointmentPayment.price.price,
            rawData: appointment.bookAppointment,
          };
        } catch (error) {
          console.error(
            `Erro ao converter dados do agendamento ${index}:`,
            error
          );
          return null;
        }
      })
      .filter(Boolean);

    return transformed;
  };

  const fetchAppointments = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (status && status !== "ALL") {
        response = await getBookingsByStatus(status);
      } else {
        response = await getAllBookings();
      }

      if (response && response.data && response.data.code === 200) {
        let appointmentsArray = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          appointmentsArray = response.data.data;
        } else {
          console.error("Estrutura de dados inesperada:", response.data);
        }

        const transformedData = transformAppointmentData(appointmentsArray);

        setCanceledAppointments(transformedData);
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (err) {
      setError("Não foi possível obter a lista de agendamentos");
      console.error(
        `Erro ao buscar dados para o status [${status || "ALL"}]:`,
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccountInfo = async (patientId: string) => {
    try {
      setLoadingBankInfo(true);
      setBankInfoError(null);

      const response = await getPatientBankAccount(patientId);

      if (response && response.data && response.data.code === 200) {
        setBankInfo({
          bankName: response.data.data.bankName,
          accountNumber: response.data.data.accountNumber,
        });
      } else {
        setBankInfo(null);
        setBankInfoError("Informações bancárias não encontradas");
      }
    } catch (err: any) {
      console.error("Erro ao buscar informações bancárias:", err);
      setBankInfo(null);

      if (err.response && err.response.status === 404) {
        setBankInfoError(
          "O paciente ainda não atualizou as informações bancárias"
        );
      } else {
        setBankInfoError("Erro ao buscar informações bancárias");
      }
    } finally {
      setLoadingBankInfo(false);
    }
  };

  const handleViewDetails = async (appointment: any) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);

    setBankInfo(null);
    setBankInfoError(null);

    if (appointment.patientUserId) {
      await fetchBankAccountInfo(appointment.patientUserId);
    }
  };

  const handleRefundToggle = async (appointmentId: string) => {
    if (!selectedAppointment) return;

    try {
      setProcessingRefund(true);
      await assignPayback(appointmentId);

      setCanceledAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.appointmentId === appointmentId
            ? {
                ...appointment,
                isRefunded: true,
                paymentStatus: PaymentStatus.PAY_BACK,
              }
            : appointment
        )
      );

      setModalOpen(false);
    } catch (err) {
      setError("Não foi possível processar o reembolso. Tente novamente.");
      console.error(err);
    } finally {
      setProcessingRefund(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "patientId",
      headerName: "ID do paciente",
      width: 120,
      flex: 0.8,
    },
    {
      field: "patientName",
      headerName: "Nome do paciente",
      width: 180,
      flex: 1,
    },
    {
      field: "appointmentDateTime",
      headerName: "Data e hora da consulta",
      width: 150,
      flex: 1,
    },
    {
      field: "appointmentId",
      headerName: "ID do agendamento",
      width: 120,
      flex: 0.8,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      flex: 1,
      renderCell: (params) => {
        let color = "gray";
        let statusText = "Indefinido";

        switch (params.row.status) {
          case "DONE":
            color = "green";
            statusText = "Concluído";
            break;
          case "WAITING":
            color = "orange";
            statusText = "Aguardando";
            break;
          case "CANCELLED":
            color = "red";
            statusText = "Cancelado";
            break;
          default:
            statusText = params.row.status || "Indefinido";
        }

        return (
          <span
            style={{
              color: color,
              fontWeight: "bold",
            }}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      field: "paymentStatus",
      headerName: "Status do pagamento",
      width: 150,
      flex: 1,
      renderCell: (params) => {
        let color = "gray";
        let statusText = "Indefinido";

        switch (params.row.paymentStatus) {
          case PaymentStatus.PAY_BACK:
            color = "green";
            statusText = "Reembolsado";
            break;
          case PaymentStatus.PAYED:
            color = "orange";
            statusText = "Pago";
            break;
          case PaymentStatus.CANCELED:
            color = "red";
            statusText = "Pagamento cancelado";
            break;
          case PaymentStatus.WAITING_PAY:
            color = "blue";
            statusText = "Aguardando pagamento";
            break;
        }

        return (
          <span
            style={{
              color: color,
              fontWeight: "bold",
            }}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => handleViewDetails(params.row)}
        >
          Detalhes
        </Button>
      ),
    },
  ];

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value);
  };

  return (
    <Box sx={{ height: "100%", width: "100%", padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lista de agendamentos de pacientes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel id="status-select-label">Filtrar por status</InputLabel>
        <Select
          labelId="status-select-label"
          id="status-select"
          value={selectedStatus}
          label="Filtrar por status"
          onChange={handleStatusChange}
          disabled={loading}
        >
          <MenuItem value="ALL">Todos</MenuItem>
          <MenuItem value="DONE">Concluído</MenuItem>
          <MenuItem value="WAITING">Aguardando</MenuItem>
          <MenuItem value="CANCELLED">Cancelado</MenuItem>
        </Select>
      </FormControl>

      <Paper sx={{ width: "100%" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={canceledAppointments}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
                csvOptions: {
                  fileName: "agendamentos-cancelados",
                  delimiter: ",",
                  utf8WithBom: true,
                },
              },
            }}
            disableRowSelectionOnClick
            disableColumnFilter={false}
            disableDensitySelector={false}
            disableColumnSelector={false}
            sx={{ minHeight: 400 }}
          />
        )}
      </Paper>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes do reembolso</DialogTitle>

        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>Paciente:</strong> {selectedAppointment.patientName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>ID do paciente:</strong>{" "}
                  {selectedAppointment.patientUserId}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>ID do agendamento:</strong>{" "}
                  {selectedAppointment.appointmentId}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>Data e hora da consulta:</strong>{" "}
                  {selectedAppointment.appointmentDateTime}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>ID do médico:</strong>{" "}
                  {selectedAppointment.rawData?.workSchedule?.doctor?.userId ||
                    "Sem informação"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>Médico responsável:</strong>{" "}
                  {selectedAppointment.rawData?.workSchedule?.doctor
                    ? `${selectedAppointment.rawData.workSchedule.doctor.lastName} ${selectedAppointment.rawData.workSchedule.doctor.firstName}`
                    : "Sem informação"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>Valor:</strong>{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedAppointment.price || 0)}
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6">Informações bancárias</Typography>
              </Grid>

              {loadingBankInfo ? (
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", justifyContent: "center", my: 2 }}
                >
                  <CircularProgress size={24} />
                </Grid>
              ) : bankInfoError ? (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {bankInfoError}
                  </Alert>
                </Grid>
              ) : bankInfo ? (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      <strong>Número da conta:</strong> {bankInfo.accountNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      <strong>Banco:</strong> {bankInfo.bankName}
                    </Typography>
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma informação bancária disponível
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  <strong>Status do reembolso:</strong>{" "}
                  <span
                    style={{
                      color: selectedAppointment.isRefunded ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedAppointment.isRefunded
                      ? "Reembolsado"
                      : "Não reembolsado"}
                  </span>
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Fechar</Button>
          {selectedAppointment &&
            !selectedAppointment.isRefunded &&
            selectedAppointment.status === "CANCELLED" &&
            bankInfo && (
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  handleRefundToggle(selectedAppointment.appointmentId)
                }
                disabled={processingRefund || !bankInfo || loadingBankInfo}
              >
                {processingRefund
                  ? "Processando..."
                  : "Marcar como reembolsado"}
              </Button>
            )}
          {selectedAppointment &&
            !selectedAppointment.isRefunded &&
            selectedAppointment.status === "CANCELLED" &&
            !bankInfo &&
            !loadingBankInfo && (
              <Button variant="contained" color="primary" disabled={true}>
                Não é possível reembolsar (sem informações bancárias)
              </Button>
            )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
