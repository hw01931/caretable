FROM nginx:alpine

# 프로젝트 전체 정적 파일을 Nginx 기본 서빙 경로로 복사
COPY . /usr/share/nginx/html

# Hugging Face Spaces는 기본 포트로 7860을 사용하므로 default.conf의 80 포트를 7860으로 리라이팅
RUN sed -i 's/listen[[:space:]]*80;/listen 7860;/g' /etc/nginx/conf.d/default.conf

# 7860 포트 노출
EXPOSE 7860

CMD ["nginx", "-g", "daemon off;"]
