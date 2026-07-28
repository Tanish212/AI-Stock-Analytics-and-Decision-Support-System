import streamlit as st

def create_navbar():

    st.markdown("""
    <div class="navbar">

        <div class="navbar-left">

            <div class="logo">
                📈 AI Stock Analytics
            </div>

        </div>

        <div class="navbar-center">

            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">Services</a>
            <a href="#">FAQ</a>

        </div>

        <div class="navbar-right">

            <a href="#" class="profile">👤 Profile</a>

            <button class="start-btn">
                Get Started
            </button>

        </div>

    </div>

    <div class="navbar-divider"></div>
    """, unsafe_allow_html=True)