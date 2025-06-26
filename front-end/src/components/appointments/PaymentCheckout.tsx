import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CardMedia,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";

interface PaymentCheckoutProps {
  onPaymentComplete: (paymentContent: string) => Promise<void>;
  workSchedule: any;
  service: any;
  loading: boolean;
}

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  onPaymentComplete,
  workSchedule,
  service,
  loading,
}) => {
  const user = useSelector((state: any) => state.user.user);
  const [appointmentFee, setAppointmentFee] = useState<number>(0);
  const [fetchingPrice, setFetchingPrice] = useState<boolean>(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const code = workSchedule.id + user.userId.replace(/-/g, "");
  const acc = import.meta.env.VITE_ACC;
  const bank = import.meta.env.VITE_BANK;
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const getIntervalNumber = useRef<Timeout | null>(null);

  const client = new Client({
    brokerURL: `wss://${import.meta.env.VITE_HOST}/appointment/socket`,
    onConnect: () => {
      client.subscribe("/patient/result_check_payment", () => {
        setVerifyingPayment(true);
      });
    },
  });

  useEffect(() => {
    const fetchAppointmentPrice = async () => {
      try {
        setFetchingPrice(true);
        setPriceError(null);

        let response;
        if (service && service.name) {
          response = await getAppointmentPriceByTypeDisease(service.name);

          if (response.code === 200 && !response.data) {
            response = await getAppointmentPrice();
          }
        } else {
          response = await getAppointmentPrice();
        }
        console.log("response", response);
        if (response.code === 200 && response.data) {
          if (Array.isArray(response.data)) {
            const validPrices = response.data.filter(
              (item) => item.status === true
            );
            if (validPrices.length > 0) {
              setAppointmentFee(validPrices[0].price);
            } else {
              setPriceError(
                "Não foi possível encontrar informações de preço válidas"
              );
            }
          } else {
            setAppointmentFee(response.data.price);
          }
        } else {
          setPriceError(
            "Não foi possível obter informações da taxa de consulta"
          );
          console.error("API error:", response);
        }
      } catch (error) {
        setPriceError(
          "Ocorreu um erro ao obter informações da taxa de consulta"
        );
        console.error("Failed to fetch appointment price:", error);
      } finally {
        setFetchingPrice(false);
      }
    };

    fetchAppointmentPrice();
  }, [service]);

  useEffect(() => {
    client.activate();

    getIntervalNumber.current = setInterval(() => {
      if (appointmentFee > 0) {
        client.publish({
          destination: "/app/check_payment",
          body: JSON.stringify({
            amount_in: appointmentFee,
            transaction_content: code,
          }),
        });

        if (verifyingPayment) {
          onPaymentComplete(code).catch((error) => {
            console.log(error);
            setPaymentError(
              "Ocorreu um erro durante a verificação do pagamento."
            );
          });
        }
      }
    }, 1000);

    return () => {
      client.deactivate();
      clearInterval(getIntervalNumber.current);
    };
  }, [appointmentFee, verifyingPayment, code, client, onPaymentComplete]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações de pagamento
        </Typography>

        {fetchingPrice ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Carregando informações da taxa de consulta...
            </Typography>
          </Box>
        ) : priceError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {priceError}
          </Alert>
        ) : (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Taxa de consulta: {appointmentFee.toLocaleString("pt-BR")} BRL
          </Typography>
        )}

        {paymentError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {paymentError}
          </Alert>
        )}

        {!fetchingPrice && !priceError && (
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 2, mb: 2 }}
          >
            {/* Exibição do código QR */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardMedia
                component="img"
                image={`https://qr.sepay.vn/img?bank=${bank}&acc=${acc}&template=compact&amount=${appointmentFee}&des=${code}`}
                alt="Código QR para pagamento"
                sx={{
                  width: { xs: "100%", sm: "80%", md: "100%" },
                  maxWidth: "250px",
                  height: "auto",
                }}
              />
            </Grid>
            {/* Exibição das informações para transferência */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Informações para transferência:</strong>
                </Typography>

                <Grid container spacing={1} mt={1}>
                  <Grid item xs={5}>
                    <Typography variant="body2">Titular da conta:</Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2" fontWeight="bold">
                      NGUYEN HO DANG QUANG
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2">Banco:</Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2" fontWeight="bold">
                      Banco BIDV (Banco de Investimento e Desenvolvimento do
                      Vietnã)
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2">Número da conta:</Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2" fontWeight="bold">
                      {acc}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2">Valor:</Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2" fontWeight="bold">
                      {appointmentFee.toLocaleString("pt-BR")} BRL
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2">
                      Descrição da transferência:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2" fontWeight="bold">
                      {code}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  Use o aplicativo do banco para escanear o código QR ou faça a
                  transferência manualmente usando as informações acima.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentCheckout;
