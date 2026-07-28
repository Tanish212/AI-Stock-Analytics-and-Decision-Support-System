import streamlit as st
from pathlib import Path

from components.navbar import create_navbar
from components.hero import create_hero

st.set_page_config(
    page_title="AI Stock Analytics",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed"
)

def load_css():
    with open("assets/css/style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

load_css()

create_navbar()
create_hero()