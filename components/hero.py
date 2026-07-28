import streamlit as st

def create_hero():

    st.markdown("<br>", unsafe_allow_html=True)

    left, center, right = st.columns([1,3,1])

    with center:

        st.caption("🚀 AI-Driven Financial Intelligence")

        st.markdown(
            """
# AI-Powered Stock Analytics
# & Decision Support System
"""
        )

        st.markdown(
            """
Harness **Machine Learning**, **Technical Analysis**, and
AI-driven insights to analyze market trends and
support smarter investment decisions.
"""
        )

        st.markdown("<br>", unsafe_allow_html=True)

        b1,b2,b3 = st.columns([2,1,2])

        with b2:

            st.button(
                "Get Started for Free",
                use_container_width=True,
                type="primary"
            )