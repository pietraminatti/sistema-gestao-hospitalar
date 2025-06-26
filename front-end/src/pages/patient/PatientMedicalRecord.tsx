import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { formatCreatedAtDate } from "../../utils/dateUtils";
import { useSelector } from "react-redux";
import { PatientData } from "../../types";

const PatientMedicalRecord: React.FC = () => {
  const user = useSelector((state: any) => state.user.user);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [patientLoading, setPatientLoading] = useState<boolean>(false);
  const [patientError, setPatientError] = useState<string | null>(null);

  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<number[]>([]);

  const handleToggleRecord = (recordId: number) => {
    setExpandedRecords((prev) => {
      if (prev.includes(recordId)) {
        return prev.filter((id) => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "WAITING":
        return "Aguardando";
      case "IN_PROGRESS":
        return "Em Atendimento";
      case "DONE":
        return "Concluído";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {/* Informações do paciente */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            INFORMAÇÕES DO PACIENTE
          </Typography>

          {patientLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          ) : patientError ? (
            <Alert severity="error">{patientError}</Alert>
          ) : patient ? (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Nome completo:</strong> {patient.sobrenome}{" "}
                      {patient.nome}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>ID do paciente:</strong> {patient.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Telefone:</strong> {patient.telefone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Email:</strong> {patient.email}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">Nenhuma informação do paciente</Alert>
          )}
        </Box>

        {/* Histórico médico */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          HISTÓRICO DE ATENDIMENTOS
        </Typography>

        {medicalRecords.length === 0 ? (
          <Alert severity="info">Nenhum histórico de atendimento</Alert>
        ) : (
          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            {medicalRecords.map((record) => (
              <React.Fragment key={record.id}>
                <ListItem
                  disablePadding
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleToggleRecord(record.id)}
                    >
                      {expandedRecords.includes(record.id) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => handleToggleRecord(record.id)}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {formatCreatedAtDate(record.dateAppoinment)} -{" "}
                          {record.diagnosisDisease || "Sem diagnóstico"}
                        </Typography>
                      }
                      secondary={
                        <Box
                          component="span"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mt={0.5}
                        >
                          <span>Médico: {record.doctorName}</span>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>

                <Collapse
                  in={expandedRecords.includes(record.id)}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#f8f8f8",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Data do atendimento:</strong>{" "}
                          {formatCreatedAtDate(record.dateAppoinment)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Médico responsável:</strong>{" "}
                          {record.doctorName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>ID da consulta:</strong>{" "}
                          {record.appointmentId}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default PatientMedicalRecord;
