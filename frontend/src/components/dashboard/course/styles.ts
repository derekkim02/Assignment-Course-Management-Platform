import { CSSProperties } from 'styled-components';

const bannerStyle = {
  backgroundColor: '#f0f2f5',
  border: '1px solid #d9d9d9',
  borderRadius: '8px',
  marginBottom: '20px',
  width: '90%',
  alignSelf: 'center',
};

const listContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
};

const footerLineStyle: CSSProperties = {
  borderTop: '1px solid #d9d9d9',
  marginTop: '20px',
  paddingTop: '10px',
  textAlign: 'center',
};

export { bannerStyle, listContainerStyle, footerLineStyle };
