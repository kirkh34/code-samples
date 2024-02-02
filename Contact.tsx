/* This is from the contact page on AnderprintsDTF.com */
import React, { useRef, useState } from 'react';
import { TextField, Typography, Box, Stack } from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import ContactImg from '../../../public/static/images/contact_us.svg';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ContactValues, ContactSchema } from './types';
import { useCart } from '../../context/CartContext';
import { LoadingButton } from '@mui/lab';
import { sendEmail } from '../../utils/helpers';

const ContactForm = () => {
  const [disabledBtn, setDisabledBtn] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const contactForm = useForm<ContactValues>({
    defaultValues: { name: '', email: '', message: '' },
    resolver: zodResolver(ContactSchema),
  });

  const { setDialogDetails, setOpenDialog } = useCart();
  const recaptchaRef = useRef<any>();

  const { register, formState, reset } = contactForm;
  const { errors } = formState;

  const resetForm = () => {
    recaptchaRef.current.reset();
    reset();
    setDisabledBtn(true);
    setButtonLoading(false);
  };

  const onSubmit = async (data: any) => {
    setButtonLoading(true);
    const subject = 'New Message from Contact Page at AnderprintsDTF.com';
    let body = `Name: ${data.name} \n`;
    body += `Email: ${data.email} \n`;
    body += `Message: ${data.message}`;

    const response = await sendEmail(
      'TEXT',
      subject,
      body,
      'support@anderprintsdtf.com'
    );

    const res = await response.json();
    if (res.success) {
      setDialogDetails({
        title: 'Success',
        description: 'Your message was successfully sent.',
      });
      setOpenDialog(true);
    } else {
      setDialogDetails({
        title: 'Error',
        description:
          'There was an error sending your message.  Please email support@anderprintsdtf.com directly',
      });
      setOpenDialog(true);
    }
    resetForm();
  };
  const handleRecaptcha = () => {
    setDisabledBtn(false);
  };

  return (
    <Stack
      spacing={4}
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        display: 'flex',
        //justifyContent: 'flex-start',
        //alignItems: 'center',
        backgroundColor: '',
      }}
    >
      <Box
        component='img'
        sx={{
          alignSelf: { xs: 'center', md: 'flex-start' },
          backgroundColor: '',
          width: '50%',
          px: { md: '5rem' },
          pt: { md: '1rem' },
        }}
        alt='Contact Us'
        src={ContactImg.src}
      />
      <form onSubmit={contactForm.handleSubmit(onSubmit)} noValidate>
        <Stack
          display='flex'
          spacing={4}
          //my={4}
          my={3}
          sx={{ backgroundColor: '' }}
        >
          <Typography variant='h6'>
            Please fill in your name, email, and message below. We will email
            you back with a response as soon as we can. Thank you!
          </Typography>
          <TextField
            id='name'
            label='Name'
            fullWidth
            autoComplete='given-name'
            variant='standard'
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            required
            id={`email`}
            label='Email'
            fullWidth
            autoComplete={`email`}
            variant='standard'
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id='message'
            label='Message'
            fullWidth
            variant='standard'
            multiline
            rows={8}
            {...register('message')}
            error={!!errors.message}
            helperText={errors.message?.message}
            InputLabelProps={{ shrink: true }}
          />

          <Box alignSelf='flex-end'>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY as string}
              onChange={handleRecaptcha}
              onExpired={() => {
                setDisabledBtn(true);
              }}
            />
          </Box>

          <LoadingButton
            loading={buttonLoading}
            disabled={disabledBtn}
            type='submit'
            variant='contained'
            sx={{
              mt: 2,
              alignSelf: 'flex-end',
              width: { xs: '100%', sm: '25%' },
            }}
          >
            Submit
          </LoadingButton>
        </Stack>
      </form>
    </Stack>
  );
};

export default ContactForm;
