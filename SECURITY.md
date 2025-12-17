# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of ThinkTap seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** disclose the vulnerability publicly

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report the vulnerability

Send an email to **security@thinktap.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Within 90 days

## Security Best Practices

### For Developers

1. **Dependencies**
   - Regularly update dependencies
   - Run `npm audit` before each release
   - Use `npm audit fix` to automatically fix vulnerabilities

2. **Authentication**
   - Never commit credentials to version control
   - Use strong JWT secrets (minimum 64 characters)
   - Rotate secrets regularly

3. **Database**
   - Use prepared statements (Prisma handles this)
   - Never expose raw SQL queries to users
   - Regularly backup database

4. **API Security**
   - Implement rate limiting
   - Validate all input
   - Sanitize output
   - Use HTTPS in production

### For Deployments

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Different secrets per environment

2. **SSL/TLS**
   - Always use HTTPS in production
   - Use certificates from trusted CAs
   - Enable HSTS headers

3. **Access Control**
   - Implement principle of least privilege
   - Use firewall rules
   - Restrict database access

4. **Monitoring**
   - Enable logging
   - Monitor for suspicious activity
   - Set up alerts for security events

## Known Security Considerations

### JWT Tokens
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are stored securely (httpOnly cookies on web, SecureStore on mobile)

### Rate Limiting
- API: 10 requests/second
- Login: 5 attempts/minute
- Session creation: Based on user plan

### Password Requirements
- Minimum 8 characters
- Stored using bcrypt with salt rounds = 10

### CORS
- Configured to allow only specified origins
- Credentials allowed only for trusted domains

## Security Checklist for Production

- [ ] All secrets are strong and unique
- [ ] HTTPS/SSL configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Database backups automated
- [ ] Logs are monitored
- [ ] Dependencies are up to date
- [ ] Security headers configured
- [ ] Firewall rules in place
- [ ] Access control implemented

## Contact

For security concerns: **security@thinktap.com**

For general issues: [GitHub Issues](https://github.com/yourusername/thinktap/issues)

