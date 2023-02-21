import styled from "styled-components";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React from "react";
import { useNavigate } from "react-router-dom";

const FooterContainer = styled.div`
  width: 100%;
  color: white;
  min-height: 2vh;
  line-height: 25px;

  padding-top: 2vh;
  padding-bottom: 2vh;
  line-height: 2vh;

  font-size: 12px;
  background-color: white;
  opacity: 0.75;
  color: #444;
  background-color: #fafafa;
`;

const BackContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  align-content: center;
`;

const FooterText = styled.p`
  padding-left: 5px;
`;

export const Footer = () => {
  const navigate = useNavigate();
  return (
    <FooterContainer className="footer" id="footer">
      <BackContainer
        onClick={() => {
          navigate("/");
        }}
      >
        <ArrowBackIcon />
        <FooterText>Go back to all hikes</FooterText>
      </BackContainer>
    </FooterContainer>
  );
};
